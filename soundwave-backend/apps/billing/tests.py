from datetime import date
from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import ArtistProfile, User
from apps.billing.models import Payout, PaymentTransaction, Subscription, SubscriptionPlan


def _make_user(email, **extra_fields):
    return User.objects.create_user(email=email, username=email, password="pass1234", **extra_fields)


class FakeGateway:
    """Stands in for apps.billing.gateways.get_gateway() so tests never hit a real
    payment provider over the network.
    """

    def __init__(self, verified=True):
        self.verified = verified

    def request_payment(self, *, amount, description, callback_url):
        return "https://sandbox.zarinpal.com/pg/StartPay/fake-authority", "fake-authority"

    def verify_payment(self, *, reference_id, amount):
        return self.verified


class PricingAdminTests(APITestCase):
    def test_admin_can_update_prices_non_admin_gets_403(self):
        admin = _make_user("price-admin@example.com", role=User.Role.ADMIN)
        listener = _make_user("price-listener@example.com")

        self.client.force_authenticate(user=listener)
        response = self.client.patch(
            "/api/v1/billing/plans/price/", {"silver_price": "50000", "gold_price": "90000"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=admin)
        response = self.client.patch(
            "/api/v1/billing/plans/price/", {"silver_price": "50000", "gold_price": "90000"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        silver = SubscriptionPlan.objects.get(tier=SubscriptionPlan.Tier.SILVER)
        gold = SubscriptionPlan.objects.get(tier=SubscriptionPlan.Tier.GOLD)
        self.assertEqual(str(silver.monthly_price), "50000.00")
        self.assertEqual(str(gold.monthly_price), "90000.00")


class SubscribeFlowTests(APITestCase):
    def test_subscribing_creates_pending_payment_transaction(self):
        SubscriptionPlan.objects.create(tier=SubscriptionPlan.Tier.GOLD, monthly_price=90000)
        listener = _make_user("subscriber@example.com")
        self.client.force_authenticate(user=listener)

        with patch("apps.billing.views.get_gateway", return_value=FakeGateway()):
            response = self.client.post(
                "/api/v1/billing/subscribe/", {"plan_tier": "gold", "duration_months": 1}
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("redirect_url", response.data)

        payment = PaymentTransaction.objects.get(user=listener)
        self.assertEqual(payment.status, PaymentTransaction.Status.PENDING)
        self.assertEqual(payment.plan_tier, SubscriptionPlan.Tier.GOLD)
        self.assertEqual(payment.gateway_ref_id, "fake-authority")

    def test_successful_callback_activates_subscription(self):
        plan = SubscriptionPlan.objects.create(tier=SubscriptionPlan.Tier.SILVER, monthly_price=50000)
        listener = _make_user("callback-user@example.com")
        self.client.force_authenticate(user=listener)

        with patch("apps.billing.views.get_gateway", return_value=FakeGateway()):
            subscribe_response = self.client.post(
                "/api/v1/billing/subscribe/", {"plan_tier": "silver", "duration_months": 3}
            )
        payment_id = PaymentTransaction.objects.get(user=listener).id

        with patch("apps.billing.views.get_gateway", return_value=FakeGateway(verified=True)):
            callback_response = self.client.get(
                f"/api/v1/billing/payment/callback/?transaction_id={payment_id}&Status=OK&Authority=fake-authority"
            )

        self.assertEqual(callback_response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(callback_response.url, f"http://localhost:3000/payment/result?status={PaymentTransaction.Status.SUCCESS}")

        subscription = Subscription.objects.get(user=listener)
        self.assertEqual(subscription.status, Subscription.Status.ACTIVE)
        self.assertEqual(subscription.plan, plan)
        self.assertEqual(subscription.duration_months, 3)

    def test_user_cancelling_at_gateway_redirects_to_frontend_without_activating(self):
        SubscriptionPlan.objects.create(tier=SubscriptionPlan.Tier.GOLD, monthly_price=90000)
        listener = _make_user("cancelled-user@example.com")
        self.client.force_authenticate(user=listener)

        with patch("apps.billing.views.get_gateway", return_value=FakeGateway()):
            self.client.post("/api/v1/billing/subscribe/", {"plan_tier": "gold", "duration_months": 1})
        payment_id = PaymentTransaction.objects.get(user=listener).id

        response = self.client.get(
            f"/api/v1/billing/payment/callback/?transaction_id={payment_id}&Status=NOK&Authority=fake-authority"
        )

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.url, f"http://localhost:3000/payment/result?status={PaymentTransaction.Status.FAILED}")
        self.assertEqual(
            PaymentTransaction.objects.get(pk=payment_id).status, PaymentTransaction.Status.FAILED
        )
        self.assertFalse(Subscription.objects.filter(user=listener).exists())

    def test_failed_verification_marks_transaction_failed_without_activating(self):
        SubscriptionPlan.objects.create(tier=SubscriptionPlan.Tier.GOLD, monthly_price=90000)
        listener = _make_user("failed-user@example.com")
        self.client.force_authenticate(user=listener)

        with patch("apps.billing.views.get_gateway", return_value=FakeGateway()):
            self.client.post("/api/v1/billing/subscribe/", {"plan_tier": "gold", "duration_months": 1})
        payment_id = PaymentTransaction.objects.get(user=listener).id

        with patch("apps.billing.views.get_gateway", return_value=FakeGateway(verified=False)):
            response = self.client.get(
                f"/api/v1/billing/payment/callback/?transaction_id={payment_id}&Status=OK&Authority=fake-authority"
            )

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.url, f"http://localhost:3000/payment/result?status={PaymentTransaction.Status.FAILED}")
        self.assertFalse(Subscription.objects.filter(user=listener).exists())


class PayoutVisibilityTests(APITestCase):
    def test_listener_cannot_see_other_artists_payout_rows(self):
        artist_user = _make_user("payout-artist@example.com", role=User.Role.ARTIST)
        artist_profile = ArtistProfile.objects.create(user=artist_user, stage_name="Payout Artist")
        Payout.objects.create(artist_profile=artist_profile, period_month=date(2026, 7, 1), amount=100)

        listener = _make_user("payout-listener@example.com")
        self.client.force_authenticate(user=listener)

        response = self.client.get("/api/v1/billing/payouts/")
        count = response.data["count"] if "count" in response.data else len(response.data)
        self.assertEqual(count, 0)

    def test_artist_sees_only_their_own_payouts(self):
        artist_user = _make_user("own-payout-artist@example.com", role=User.Role.ARTIST)
        artist_profile = ArtistProfile.objects.create(user=artist_user, stage_name="Own Payout Artist")
        Payout.objects.create(artist_profile=artist_profile, period_month=date(2026, 7, 1), amount=250)

        other_artist_user = _make_user("other-payout-artist@example.com", role=User.Role.ARTIST)
        other_profile = ArtistProfile.objects.create(user=other_artist_user, stage_name="Other Payout Artist")
        Payout.objects.create(artist_profile=other_profile, period_month=date(2026, 7, 1), amount=999)

        self.client.force_authenticate(user=artist_user)
        response = self.client.get("/api/v1/billing/payouts/")
        rows = response.data["results"] if "results" in response.data else response.data
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["artist_name"], "Own Payout Artist")


class ConfirmSettlementTests(APITestCase):
    def test_admin_confirms_settlement_and_notifies_artist(self):
        from apps.notifications.models import Notification

        admin = _make_user("settle-admin@example.com", role=User.Role.ADMIN)
        artist_user = _make_user("settled-artist@example.com", role=User.Role.ARTIST)
        artist_profile = ArtistProfile.objects.create(user=artist_user, stage_name="Settled Artist")
        payout = Payout.objects.create(artist_profile=artist_profile, period_month=date(2026, 7, 1), amount=500)

        self.client.force_authenticate(user=admin)
        response = self.client.post(f"/api/v1/billing/payouts/{payout.id}/confirm-settlement/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        payout.refresh_from_db()
        self.assertEqual(payout.status, Payout.Status.PAID)
        self.assertTrue(
            Notification.objects.filter(user=artist_user, kind=Notification.Kind.PAYOUT_SETTLED).exists()
        )
