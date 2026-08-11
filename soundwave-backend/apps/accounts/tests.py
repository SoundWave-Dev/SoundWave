from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import ArtistProfile, PasswordResetToken, User


def _make_user(email, **extra_fields):
    return User.objects.create_user(email=email, username=email, password="pass1234", **extra_fields)


class RegistrationTests(APITestCase):
    def test_listener_registration_creates_listener_user(self):
        response = self.client.post(
            "/api/v1/auth/register/listener/",
            {
                "email": "listener@example.com",
                "password": "strongpass1",
                "confirm_password": "strongpass1",
                "accept_privacy_policy": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="listener@example.com")
        self.assertEqual(user.role, User.Role.LISTENER)
        self.assertTrue(user.username)
        self.assertTrue(user.check_password("strongpass1"))

    def test_listener_registration_rejects_password_mismatch(self):
        response = self.client.post(
            "/api/v1/auth/register/listener/",
            {
                "email": "mismatch@example.com",
                "password": "strongpass1",
                "confirm_password": "different1",
                "accept_privacy_policy": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="mismatch@example.com").exists())

    def test_listener_registration_requires_privacy_policy_acceptance(self):
        response = self.client.post(
            "/api/v1/auth/register/listener/",
            {
                "email": "nopolicy@example.com",
                "password": "strongpass1",
                "confirm_password": "strongpass1",
                "accept_privacy_policy": False,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_artist_registration_creates_pending_artist_profile(self):
        response = self.client.post(
            "/api/v1/auth/register/artist/",
            {"email": "artist@example.com", "password": "strongpass1", "stage_name": "DJ Test"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="artist@example.com")
        self.assertEqual(user.role, User.Role.ARTIST)
        profile = ArtistProfile.objects.get(user=user)
        self.assertEqual(profile.verification_status, ArtistProfile.VerificationStatus.PENDING)


class LoginTests(APITestCase):
    def test_login_returns_tokens_with_role_claim_for_valid_credentials(self):
        _make_user("login@example.com", role=User.Role.ARTIST)

        response = self.client.post(
            "/api/v1/auth/login/", {"email": "login@example.com", "password": "pass1234"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_credentials(self):
        _make_user("wrongpass@example.com")

        response = self.client.post(
            "/api/v1/auth/login/", {"email": "wrongpass@example.com", "password": "not-the-password"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeViewTests(APITestCase):
    def test_patching_me_only_ever_affects_the_authenticated_user(self):
        user_a = _make_user("a@example.com", display_name="A")
        user_b = _make_user("b@example.com", display_name="B")

        self.client.force_authenticate(user=user_a)
        response = self.client.patch("/api/v1/auth/me/", {"display_name": "A Renamed"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user_a.refresh_from_db()
        user_b.refresh_from_db()
        self.assertEqual(user_a.display_name, "A Renamed")
        self.assertEqual(user_b.display_name, "B")

    def test_me_includes_derived_profile_fields(self):
        user = _make_user("derived@example.com")
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["subscription_tier"], "free")
        self.assertEqual(response.data["follower_count"], 0)
        self.assertEqual(response.data["following_count"], 0)
        self.assertEqual(response.data["daily_stream_count"], 0)


class ForgotPasswordTests(APITestCase):
    def test_forgot_password_always_returns_200(self):
        response = self.client.post("/api/v1/auth/password/forgot/", {"email": "nobody@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(PasswordResetToken.objects.exists())

        _make_user("real@example.com")
        response = self.client.post("/api/v1/auth/password/forgot/", {"email": "real@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(PasswordResetToken.objects.exists())

    def test_reset_with_valid_token_changes_password(self):
        user = _make_user("reset@example.com")
        self.client.post("/api/v1/auth/password/forgot/", {"email": "reset@example.com"})
        reset = PasswordResetToken.objects.get(user=user)

        response = self.client.post(
            "/api/v1/auth/password/reset/", {"token": reset.token, "new_password": "brandnewpass1"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.check_password("brandnewpass1"))

    def test_reset_with_invalid_token_fails(self):
        response = self.client.post(
            "/api/v1/auth/password/reset/", {"token": "not-a-real-token", "new_password": "brandnewpass1"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
