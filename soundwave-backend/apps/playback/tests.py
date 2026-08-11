from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import ArtistProfile, User
from apps.music.models import Album, StreamEvent, Track
from apps.playback.models import UserPreference


def _make_user(email, **extra_fields):
    return User.objects.create_user(email=email, username=email, password="pass1234", **extra_fields)


def _make_track(title):
    artist_user = _make_user(f"{title.lower().replace(' ', '-')}-artist@example.com", role=User.Role.ARTIST)
    artist_profile = ArtistProfile.objects.create(user=artist_user, stage_name=f"{title} Artist")
    album = Album.objects.create(
        title=f"{title} Album", artist_profile=artist_profile, release_year=2024, release_type=Album.ReleaseType.ALBUM
    )
    return Track.objects.create(
        title=title, album=album, audio_file=SimpleUploadedFile("track.mp3", b"data", content_type="audio/mpeg")
    )


class PreferencesTests(APITestCase):
    def test_get_preferences_creates_defaults_on_first_access(self):
        user = _make_user("first-time@example.com")
        self.client.force_authenticate(user=user)

        self.assertFalse(UserPreference.objects.filter(user=user).exists())

        response = self.client.get("/api/v1/playback/preferences/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(UserPreference.objects.filter(user=user).exists())
        self.assertEqual(response.data["system_volume"], 80)

    def test_preferences_persist_across_separate_requests(self):
        user = _make_user("multi-device@example.com")
        self.client.force_authenticate(user=user)

        response = self.client.patch(
            "/api/v1/playback/preferences/me/", {"system_volume": 42, "language": "fa"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Simulate a second device: fresh client, same user re-authenticated.
        response = self.client.get("/api/v1/playback/preferences/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["system_volume"], 42)
        self.assertEqual(response.data["language"], "fa")


class RecentlyPlayedTests(APITestCase):
    def test_returns_distinct_track_ids_most_recent_first(self):
        user = _make_user("history@example.com")
        track_a = _make_track("Track A")
        track_b = _make_track("Track B")

        # Play A, then B, then A again — A's most recent play should now rank first.
        # played_at timestamps are set explicitly (via .update()) so ordering is
        # deterministic instead of relying on auto_now_add wall-clock resolution.
        now = timezone.now()
        e1 = StreamEvent.objects.create(track=track_a, user=user)
        e2 = StreamEvent.objects.create(track=track_b, user=user)
        e3 = StreamEvent.objects.create(track=track_a, user=user)
        StreamEvent.objects.filter(pk=e1.pk).update(played_at=now - timedelta(minutes=10))
        StreamEvent.objects.filter(pk=e2.pk).update(played_at=now - timedelta(minutes=5))
        StreamEvent.objects.filter(pk=e3.pk).update(played_at=now)

        self.client.force_authenticate(user=user)
        response = self.client.get("/api/v1/playback/recently-played/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [track_a.id, track_b.id])
