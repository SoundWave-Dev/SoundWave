from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.notifications.models import Notification


def _make_user(email):
    return User.objects.create_user(email=email, username=email, password="pass1234")


def _make_notification(user, title="Notice", is_read=False):
    return Notification.objects.create(
        user=user, kind=Notification.Kind.NEW_RELEASE, title=title, is_read=is_read
    )


class NotificationScopeTests(APITestCase):
    def test_user_only_sees_own_notifications(self):
        owner = _make_user("owner@example.com")
        other = _make_user("other@example.com")
        _make_notification(owner, "Mine")
        _make_notification(other, "Not mine")

        self.client.force_authenticate(user=owner)
        response = self.client.get("/api/v1/notifications/")
        titles = [n["title"] for n in response.data["results"]] if "results" in response.data else [
            n["title"] for n in response.data
        ]
        self.assertIn("Mine", titles)
        self.assertNotIn("Not mine", titles)


class MarkReadTests(APITestCase):
    def test_mark_read_flips_a_single_notification(self):
        user = _make_user("reader@example.com")
        notification = _make_notification(user)

        self.client.force_authenticate(user=user)
        response = self.client.post(f"/api/v1/notifications/{notification.id}/mark-read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_mark_all_read_flips_every_unread_notification_for_that_user(self):
        user = _make_user("reader2@example.com")
        other = _make_user("other2@example.com")
        n1 = _make_notification(user)
        n2 = _make_notification(user)
        already_read = _make_notification(user, is_read=True)
        other_n = _make_notification(other)

        self.client.force_authenticate(user=user)
        response = self.client.post("/api/v1/notifications/mark-all-read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["updated"], 2)

        n1.refresh_from_db()
        n2.refresh_from_db()
        already_read.refresh_from_db()
        other_n.refresh_from_db()
        self.assertTrue(n1.is_read)
        self.assertTrue(n2.is_read)
        self.assertTrue(already_read.is_read)
        self.assertFalse(other_n.is_read)
