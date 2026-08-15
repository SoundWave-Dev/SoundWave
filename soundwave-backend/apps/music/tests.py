from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import ArtistProfile, User
from apps.billing.models import Subscription, SubscriptionPlan
from apps.music.models import Album, StreamEvent, Track


def _make_user(email, **extra_fields):
    return User.objects.create_user(email=email, username=email, password="pass1234", **extra_fields)


def _make_artist(email, stage_name, verification_status=ArtistProfile.VerificationStatus.APPROVED):
    user = _make_user(email, role=User.Role.ARTIST)
    return ArtistProfile.objects.create(
        user=user, stage_name=stage_name, verification_status=verification_status
    )


def _make_album(artist_profile, title="Album"):
    return Album.objects.create(
        title=title, artist_profile=artist_profile, release_year=2024, release_type=Album.ReleaseType.ALBUM
    )


def _audio_file(name="track.mp3"):
    return SimpleUploadedFile(name, b"data", content_type="audio/mpeg")


def _subscribe(user, tier, daily_stream_limit, can_view_artist_stats=False):
    plan, _ = SubscriptionPlan.objects.get_or_create(tier=tier)
    plan.daily_stream_limit = daily_stream_limit
    plan.can_view_artist_stats = can_view_artist_stats
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


class ArtistOwnershipTests(APITestCase):
    def test_approved_artist_can_create_album_and_track(self):
        artist = _make_artist("approved@example.com", "Approved Artist")
        self.client.force_authenticate(user=artist.user)

        response = self.client.post(
            "/api/v1/music/albums/",
            {"title": "New Album", "release_year": 2024, "release_type": "album"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        album_id = response.data["id"]

        response = self.client.post(
            "/api/v1/music/tracks/",
            {"title": "New Track", "album": album_id, "audio_file": _audio_file()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Track.objects.get(id=response.data["id"]).album_id, album_id)

    def test_pending_artist_gets_403(self):
        artist = _make_artist(
            "pending@example.com", "Pending Artist", verification_status=ArtistProfile.VerificationStatus.PENDING
        )
        self.client.force_authenticate(user=artist.user)

        response = self.client.post(
            "/api/v1/music/albums/",
            {"title": "New Album", "release_year": 2024, "release_type": "album"},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_artist_cannot_edit_another_artists_album(self):
        owner = _make_artist("owner@example.com", "Owner")
        other = _make_artist("other@example.com", "Other")
        album = _make_album(owner, "Owner's Album")

        self.client.force_authenticate(user=other.user)
        response = self.client.patch(f"/api/v1/music/albums/{album.id}/", {"title": "Hijacked"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        album.refresh_from_db()
        self.assertEqual(album.title, "Owner's Album")

    def test_artist_cannot_add_track_to_another_artists_album(self):
        owner = _make_artist("owner2@example.com", "Owner2")
        other = _make_artist("other2@example.com", "Other2")
        album = _make_album(owner, "Owner2's Album")

        self.client.force_authenticate(user=other.user)
        response = self.client.post(
            "/api/v1/music/tracks/",
            {"title": "Sneaky Track", "album": album.id, "audio_file": _audio_file()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class StreamingTests(APITestCase):
    def test_stream_action_increments_stream_and_unique_listener_counts(self):
        artist = _make_artist("streamed-artist@example.com", "Streamed Artist")
        album = _make_album(artist)
        track = Track.objects.create(title="Streamed Track", album=album, audio_file=_audio_file())

        listener = _make_user("listener1@example.com")
        _subscribe(listener, SubscriptionPlan.Tier.GOLD, daily_stream_limit=None, can_view_artist_stats=True)
        self.client.force_authenticate(user=listener)

        response = self.client.post(f"/api/v1/music/tracks/{track.id}/stream/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(f"/api/v1/music/tracks/{track.id}/stream/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        detail = self.client.get(f"/api/v1/music/tracks/{track.id}/")
        self.assertEqual(detail.data["stream_count"], 2)
        self.assertEqual(detail.data["unique_listeners"], 1)

    def test_unique_listeners_hidden_from_non_gold_users(self):
        artist = _make_artist("hidden-artist@example.com", "Hidden Artist")
        album = _make_album(artist)
        track = Track.objects.create(title="Hidden Stats Track", album=album, audio_file=_audio_file())

        listener = _make_user("free-viewer@example.com")
        _subscribe(listener, SubscriptionPlan.Tier.FREE, daily_stream_limit=60, can_view_artist_stats=False)
        self.client.force_authenticate(user=listener)

        detail = self.client.get(f"/api/v1/music/tracks/{track.id}/")
        self.assertIsNone(detail.data["unique_listeners"])

    def test_owning_artist_sees_unique_listeners_without_a_subscription(self):
        artist = _make_artist("owner-artist@example.com", "Owner Artist")
        album = _make_album(artist)
        track = Track.objects.create(title="Owner's Track", album=album, audio_file=_audio_file())

        listener = _make_user("plain-listener@example.com")
        self.client.force_authenticate(user=listener)
        self.client.post(f"/api/v1/music/tracks/{track.id}/stream/")

        # The artist has no Subscription at all (get_active_plan returns None) — they
        # must still see their own track's stats.
        self.client.force_authenticate(user=artist.user)
        detail = self.client.get(f"/api/v1/music/tracks/{track.id}/")
        self.assertEqual(detail.data["unique_listeners"], 1)

    def test_collaborator_sees_unique_listeners_without_a_subscription(self):
        owner = _make_artist("collab-owner@example.com", "Collab Owner")
        collaborator = _make_artist("collab-artist@example.com", "Collaborator")
        album = _make_album(owner)
        track = Track.objects.create(title="Collab Track", album=album, audio_file=_audio_file())
        track.collaborators.add(collaborator)

        listener = _make_user("collab-listener@example.com")
        self.client.force_authenticate(user=listener)
        self.client.post(f"/api/v1/music/tracks/{track.id}/stream/")

        self.client.force_authenticate(user=collaborator.user)
        detail = self.client.get(f"/api/v1/music/tracks/{track.id}/")
        self.assertEqual(detail.data["unique_listeners"], 1)

    def test_non_owning_artist_without_gold_still_hidden(self):
        artist = _make_artist("stats-artist@example.com", "Stats Artist")
        other_artist = _make_artist("other-artist-viewer@example.com", "Other Artist Viewer")
        album = _make_album(artist)
        track = Track.objects.create(title="Someone Else's Track", album=album, audio_file=_audio_file())

        self.client.force_authenticate(user=other_artist.user)
        detail = self.client.get(f"/api/v1/music/tracks/{track.id}/")
        self.assertIsNone(detail.data["unique_listeners"])

    def test_free_tier_user_blocked_after_daily_stream_limit(self):
        artist = _make_artist("limit-artist@example.com", "Limit Artist")
        album = _make_album(artist)
        track = Track.objects.create(title="Limited Track", album=album, audio_file=_audio_file())

        listener = _make_user("limited-listener@example.com")
        _subscribe(listener, SubscriptionPlan.Tier.FREE, daily_stream_limit=2, can_view_artist_stats=False)
        self.client.force_authenticate(user=listener)

        for _ in range(2):
            response = self.client.post(f"/api/v1/music/tracks/{track.id}/stream/")
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post(f"/api/v1/music/tracks/{track.id}/stream/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(StreamEvent.objects.filter(user=listener, track=track).count(), 2)


class SearchTests(APITestCase):
    def test_search_by_track_title_and_artist_name(self):
        artist = _make_artist("search-artist@example.com", "Searchable Artist Name")
        album = _make_album(artist)
        Track.objects.create(title="Unique Track Title", album=album, audio_file=_audio_file())

        self.client.force_authenticate(user=_make_user("searcher@example.com"))

        response = self.client.get("/api/v1/music/tracks/", {"search": "Unique Track Title"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

        response = self.client.get("/api/v1/music/tracks/", {"search": "Searchable Artist Name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
