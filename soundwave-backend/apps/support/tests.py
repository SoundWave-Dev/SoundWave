from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import ArtistProfile, User
from apps.notifications.models import Notification
from apps.support.models import Ticket


def _make_user(email, **extra_fields):
    return User.objects.create_user(email=email, username=email, password="pass1234", **extra_fields)


class TicketVisibilityTests(APITestCase):
    def test_listener_can_create_ticket_and_only_sees_own(self):
        listener = _make_user("listener@example.com")
        other = _make_user("other@example.com")
        Ticket.objects.create(user=other, subject="Someone else's problem")

        self.client.force_authenticate(user=listener)
        response = self.client.post("/api/v1/support/tickets/", {"subject": "My problem"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get("/api/v1/support/tickets/")
        subjects = [t["subject"] for t in response.data["results"]] if "results" in response.data else [
            t["subject"] for t in response.data
        ]
        self.assertIn("My problem", subjects)
        self.assertNotIn("Someone else's problem", subjects)

    def test_support_user_sees_all_tickets(self):
        listener = _make_user("listener2@example.com")
        support = _make_user("support@example.com", role=User.Role.SUPPORT)
        Ticket.objects.create(user=listener, subject="Ticket A")
        Ticket.objects.create(user=support, subject="Ticket B")

        self.client.force_authenticate(user=support)
        response = self.client.get("/api/v1/support/tickets/")
        count = response.data["count"] if "count" in response.data else len(response.data)
        self.assertEqual(count, 2)

    def test_creating_a_ticket_notifies_support_and_admin(self):
        support = _make_user("notify-support@example.com", role=User.Role.SUPPORT)
        admin = _make_user("notify-admin@example.com", role=User.Role.ADMIN)
        listener = _make_user("notify-listener@example.com")

        self.client.force_authenticate(user=listener)
        self.client.post("/api/v1/support/tickets/", {"subject": "Help!"})

        self.assertTrue(Notification.objects.filter(user=support, kind=Notification.Kind.NEW_TICKET).exists())
        self.assertTrue(Notification.objects.filter(user=admin, kind=Notification.Kind.NEW_TICKET).exists())

    def test_ticket_messages_thread(self):
        listener = _make_user("thread-listener@example.com")
        ticket = Ticket.objects.create(user=listener, subject="Thread test")

        self.client.force_authenticate(user=listener)
        response = self.client.post(f"/api/v1/support/tickets/{ticket.id}/messages/", {"body": "Hello"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(f"/api/v1/support/tickets/{ticket.id}/messages/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["body"], "Hello")


class ArtistVerificationTests(APITestCase):
    def test_approve_sets_status_and_notifies_artist(self):
        support = _make_user("approver@example.com", role=User.Role.SUPPORT)
        artist_user = _make_user("pending-artist@example.com", role=User.Role.ARTIST)
        profile = ArtistProfile.objects.create(user=artist_user, stage_name="Pending Artist")

        self.client.force_authenticate(user=support)
        response = self.client.post(f"/api/v1/support/artist-verifications/{profile.id}/approve/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile.refresh_from_db()
        self.assertEqual(profile.verification_status, ArtistProfile.VerificationStatus.APPROVED)
        self.assertTrue(
            Notification.objects.filter(
                user=artist_user, kind=Notification.Kind.ARTIST_VERIFICATION_RESULT
            ).exists()
        )

    def test_reject_requires_reason_and_stores_it(self):
        support = _make_user("rejecter@example.com", role=User.Role.SUPPORT)
        artist_user = _make_user("rejected-artist@example.com", role=User.Role.ARTIST)
        profile = ArtistProfile.objects.create(user=artist_user, stage_name="Rejected Artist")

        self.client.force_authenticate(user=support)

        response = self.client.post(f"/api/v1/support/artist-verifications/{profile.id}/reject/", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(
            f"/api/v1/support/artist-verifications/{profile.id}/reject/", {"reason": "Incomplete portfolio"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile.refresh_from_db()
        self.assertEqual(profile.verification_status, ArtistProfile.VerificationStatus.REJECTED)
        self.assertEqual(profile.rejection_reason, "Incomplete portfolio")
