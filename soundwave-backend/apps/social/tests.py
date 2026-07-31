from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.social.models import Follow


def _make_user(email):
    return User.objects.create_user(email=email, username=email, password="pass1234")


class FollowToggleTests(APITestCase):
    def test_follow_then_stats_reflect_counts(self):
        follower = _make_user("follower@example.com")
        followee = _make_user("followee@example.com")

        self.client.force_authenticate(user=follower)
        response = self.client.post(f"/api/v1/social/users/{followee.id}/follow/")
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))

        response = self.client.get(f"/api/v1/social/users/{followee.id}/follow-stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["follower_count"], 1)
        self.assertTrue(response.data["is_following"])

    def test_unfollow_removes_row_and_updates_stats(self):
        follower = _make_user("follower2@example.com")
        followee = _make_user("followee2@example.com")
        Follow.objects.create(follower=follower, followee=followee)

        self.client.force_authenticate(user=follower)
        response = self.client.delete(f"/api/v1/social/users/{followee.id}/follow/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(f"/api/v1/social/users/{followee.id}/follow-stats/")
        self.assertEqual(response.data["follower_count"], 0)
        self.assertFalse(response.data["is_following"])

    def test_cannot_follow_self(self):
        user = _make_user("solo@example.com")
        self.client.force_authenticate(user=user)

        response = self.client.post(f"/api/v1/social/users/{user.id}/follow/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Follow.objects.count(), 0)

    def test_following_twice_is_idempotent(self):
        follower = _make_user("follower3@example.com")
        followee = _make_user("followee3@example.com")

        self.client.force_authenticate(user=follower)
        self.client.post(f"/api/v1/social/users/{followee.id}/follow/")
        self.client.post(f"/api/v1/social/users/{followee.id}/follow/")

        self.assertEqual(Follow.objects.filter(follower=follower, followee=followee).count(), 1)
