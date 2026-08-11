import calendar

from django.conf import settings
from django.db import transaction as db_transaction
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.permissions import IsAdmin, IsSupportOrAdmin
from apps.billing.gateways import PaymentGatewayError, get_gateway
from apps.billing.models import Payout, PaymentTransaction, Subscription, SubscriptionPlan
from apps.billing.serializers import (
    PaymentTransactionSerializer,
    PayoutSerializer,
    SubscribeRequestSerializer,
    SubscriptionPlanPriceUpdateSerializer,
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
)
from apps.notifications.models import Notification


def _add_months(dt, months):
    month_index = dt.month - 1 + months
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    day = min(dt.day, calendar.monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)


class SubscriptionPlanListView(generics.ListAPIView):
    """Public: powers the pricing table on /settings and /login (spec §2.4)."""

    permission_classes = [permissions.AllowAny]
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer


class SubscriptionPlanPriceUpdateView(APIView):
    """Admin-only pricing panel (spec §2.11.3) — updates Silver/Gold prices with
    no code change required.
    """

    permission_classes = [IsAdmin]

    def patch(self, request):
        serializer = SubscriptionPlanPriceUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        SubscriptionPlan.objects.update_or_create(
            tier=SubscriptionPlan.Tier.SILVER,
            defaults={"monthly_price": serializer.validated_data["silver_price"]},
        )
        SubscriptionPlan.objects.update_or_create(
            tier=SubscriptionPlan.Tier.GOLD,
            defaults={"monthly_price": serializer.validated_data["gold_price"]},
        )
        return Response(status=status.HTTP_200_OK)


class MySubscriptionView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubscriptionSerializer

    def get_object(self):
        subscription = (
            Subscription.objects.filter(user=self.request.user, status=Subscription.Status.ACTIVE)
            .select_related("plan")
            .order_by("-expires_at")
            .first()
        )
        if subscription is not None:
            return subscription

        # No active subscription — represent the (unsaved) implicit Free tier so the
        # settings page always has something to render.
        free_plan, _ = SubscriptionPlan.objects.get_or_create(tier=SubscriptionPlan.Tier.FREE)
        now = timezone.now()
        return Subscription(
            user=self.request.user,
            plan=free_plan,
            duration_months=Subscription.Duration.ONE_MONTH,
            status=Subscription.Status.ACTIVE,
            started_at=now,
            expires_at=now,
            auto_renew=False,
        )


class SubscribeView(APIView):
    """Kicks off a subscription purchase/renewal + payment (spec §3.2, §3.6)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubscribeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan_tier = serializer.validated_data["plan_tier"]
        duration_months = int(serializer.validated_data["duration_months"])

        plan = get_object_or_404(SubscriptionPlan, tier=plan_tier)
        amount = plan.monthly_price * duration_months

        payment = PaymentTransaction.objects.create(
            user=request.user,
            plan_tier=plan_tier,
            duration_months=duration_months,
            gateway=settings.PAYMENT_GATEWAY,
            amount=amount,
            status=PaymentTransaction.Status.PENDING,
        )

        callback_url = request.build_absolute_uri(reverse("payment-callback"))
        callback_url += f"?transaction_id={payment.id}"

        try:
            redirect_url, reference_id = get_gateway().request_payment(
                amount=amount,
                description=f"SoundWave {plan.get_tier_display()} subscription ({duration_months} months)",
                callback_url=callback_url,
            )
        except PaymentGatewayError as exc:
            payment.status = PaymentTransaction.Status.FAILED
            payment.save(update_fields=["status"])
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        payment.gateway_ref_id = reference_id
        payment.save(update_fields=["gateway_ref_id"])

        return Response({"redirect_url": redirect_url}, status=status.HTTP_201_CREATED)


class PaymentCallbackView(APIView):
    """Gateway redirects/webhooks the user here after payment (spec §3.6)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        transaction_id = request.query_params.get("transaction_id")
        payment = get_object_or_404(PaymentTransaction, pk=transaction_id)

        if payment.status != PaymentTransaction.Status.PENDING:
            return Response({"status": payment.status})

        # ZarinPal's own callback query params.
        gateway_status = request.query_params.get("Status")
        authority = request.query_params.get("Authority") or payment.gateway_ref_id

        if gateway_status == "NOK":
            payment.status = PaymentTransaction.Status.FAILED
            payment.save(update_fields=["status"])
            return Response({"status": payment.status})

        try:
            verified = get_gateway().verify_payment(reference_id=authority, amount=payment.amount)
        except PaymentGatewayError:
            verified = False

        if not verified:
            payment.status = PaymentTransaction.Status.FAILED
            payment.save(update_fields=["status"])
            return Response({"status": payment.status})

        with db_transaction.atomic():
            plan = get_object_or_404(SubscriptionPlan, tier=payment.plan_tier)
            now = timezone.now()

            # Renewing before the current subscription lapses extends its expiry
            # instead of restarting the clock from now (spec §3.2).
            current = (
                Subscription.objects.filter(user=payment.user, status=Subscription.Status.ACTIVE)
                .order_by("-expires_at")
                .first()
            )
            starts_from = current.expires_at if current and current.expires_at > now else now

            subscription = Subscription.objects.create(
                user=payment.user,
                plan=plan,
                duration_months=payment.duration_months,
                status=Subscription.Status.ACTIVE,
                started_at=now,
                expires_at=_add_months(starts_from, payment.duration_months),
                auto_renew=False,
            )

            if current is not None and current.pk != subscription.pk and current.expires_at <= now:
                current.status = Subscription.Status.EXPIRED
                current.save(update_fields=["status"])

            payment.status = PaymentTransaction.Status.SUCCESS
            payment.gateway_ref_id = authority
            payment.subscription = subscription
            payment.save(update_fields=["status", "gateway_ref_id", "subscription"])

        return Response({"status": payment.status})


class PayoutViewSet(viewsets.ReadOnlyModelViewSet):
    """Artists see their own rows; support/admin see all (spec §2.11.2 accounting tab)."""

    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("support", "admin"):
            return Payout.objects.all()
        return Payout.objects.filter(artist_profile__user=user)


class ConfirmSettlementView(APIView):
    """Admin-only 'Confirm settlement' button — toggles a payout to Paid (spec §2.11.2)."""

    permission_classes = [IsAdmin]

    def post(self, request, payout_id):
        payout = get_object_or_404(Payout, pk=payout_id)
        payout.status = Payout.Status.PAID
        payout.settled_by = request.user
        payout.settled_at = timezone.now()
        payout.save(update_fields=["status", "settled_by", "settled_at"])

        Notification.objects.create(
            user=payout.artist_profile.user,
            kind=Notification.Kind.PAYOUT_SETTLED,
            title="Payout settled",
            body=f"Your payout for {payout.period_month:%B %Y} ({payout.amount}) has been settled.",
        )
        return Response(PayoutSerializer(payout).data)


class RevenueSummaryView(APIView):
    """Aggregated-only report for the admin dashboard (spec §3.7 — never dump raw rows)."""

    permission_classes = [IsSupportOrAdmin]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        successful_this_month = PaymentTransaction.objects.filter(
            status=PaymentTransaction.Status.SUCCESS, created_at__gte=month_start
        )
        current_month_revenue = successful_this_month.aggregate(total=Sum("amount"))["total"] or 0
        by_tier = {
            row["plan_tier"]: row["total"] or 0
            for row in successful_this_month.values("plan_tier").annotate(total=Sum("amount"))
        }
        return Response({"current_month_revenue": current_month_revenue, "by_tier": by_tier})


class SubscriptionDistributionView(APIView):
    """Pie-chart data: user counts per tier (spec §2.11.3)."""

    permission_classes = [IsAdmin]

    def get(self, request):
        rows = (
            Subscription.objects.filter(status=Subscription.Status.ACTIVE)
            .values("plan__tier")
            .annotate(count=Count("user", distinct=True))
        )
        tier_counts = {row["plan__tier"]: row["count"] for row in rows}

        # Anyone without an active paid subscription is implicitly Free.
        total_users = User.objects.count()
        paid_users = sum(tier_counts.values())
        tier_counts[SubscriptionPlan.Tier.FREE] = tier_counts.get(SubscriptionPlan.Tier.FREE, 0) + max(
            total_users - paid_users, 0
        )
        return Response(tier_counts)
