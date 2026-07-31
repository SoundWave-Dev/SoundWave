from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import ArtistProfile, User
from apps.billing.models import Subscription, SubscriptionPlan
from apps.music.models import Album, Track
from apps.playlists.models import Playlist


def _make_user(email, **extra_fields):
    return User.objects.create_user(email=email, username=email, password="pass1234", **extra_fields)


def _make_track(title="Song"):
    artist_user = _make_user(f"{title.lower().replace(' ', '-')}-artist@example.com", role=User.Role.ARTIST)
    artist_profile = ArtistProfile.objects.create(user=artist_user, stage_name=f"{title} Artist")
    album = Album.objects.create(
        title=f"{title} Album", artist_profile=artist_profile, release_year=2024, release_type=Album.ReleaseType.ALBUM
    )
    return Track.objects.create(title=title, album=album, audio_file=SimpleUploadedFile("track.mp3", b"data"))


def _subscribe(user, tier, playlist_limit):
    plan, _ = SubscriptionPlan.objects.get_or_create(tier=tier, defaults={"playlist_limit": playlist_limit})
    plan.playlist_limit = playlist_limit
    plan.save()
    Subscription.objects.create(
        user=user,
        plan=plan,
        duration_months=1,
        status=Subscription.Status.ACTIVE,
        started_at=timezone.now(),
        expires_at=timezone.now() + timedelta(days=30),
    )
    return plan


class PlaylistLimitTests(APITestCase):
    def test_free_tier_blocked_at_seventh_playlist(self):
        user = _make_user("free@example.com")
        _subscribe(user, SubscriptionPlan.Tier.FREE, playlist_limit=6)
        self.client.force_authenticate(user=user)

        for i in range(6):
            response = self.client.post("/api/v1/playlists/", {"name": f"Playlist {i}"})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post("/api/v1/playlists/", {"name": "Playlist 7"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Playlist.objects.filter(owner=user).count(), 6)

    def test_gold_tier_has_no_limit(self):
        user = _make_user("gold@example.com")
        _subscribe(user, SubscriptionPlan.Tier.GOLD, playlist_limit=None)
        self.client.force_authenticate(user=user)

        for i in range(10):
            response = self.client.post("/api/v1/playlists/", {"name": f"Playlist {i}"})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Playlist.objects.filter(owner=user).count(), 10)


class PlaylistOwnershipTests(APITestCase):
    def test_user_cannot_view_or_edit_another_users_playlist(self):
        owner = _make_user("owner@example.com")
        other = _make_user("other@example.com")
        playlist = Playlist.objects.create(owner=owner, name="Owner's playlist")

        self.client.force_authenticate(user=other)
        response = self.client.get(f"/api/v1/playlists/{playlist.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.patch(f"/api/v1/playlists/{playlist.id}/", {"name": "Hacked"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        playlist.refresh_from_db()
        self.assertEqual(playlist.name, "Owner's playlist")


class PlaylistTrackManagementTests(APITestCase):
    def test_add_then_remove_track_updates_track_count(self):
        user = _make_user("listener@example.com")
        playlist = Playlist.objects.create(owner=user, name="My playlist")
        track = _make_track("Track A")

        self.client.force_authenticate(user=user)

        response = self.client.post(f"/api/v1/playlists/{playlist.id}/tracks/", {"track_id": track.id})
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))

        response = self.client.get(f"/api/v1/playlists/{playlist.id}/")
        self.assertEqual(response.data["track_count"], 1)

        response = self.client.delete(f"/api/v1/playlists/{playlist.id}/tracks/{track.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(f"/api/v1/playlists/{playlist.id}/")
        self.assertEqual(response.data["track_count"], 0)
