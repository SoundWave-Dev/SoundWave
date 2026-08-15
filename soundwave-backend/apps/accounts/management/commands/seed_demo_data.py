from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import ArtistProfile, User
from apps.accounts.serializers import _generate_username
from apps.billing.models import SubscriptionPlan, Subscription
from apps.music.models import Album, Track
from apps.notifications.models import Notification
from apps.playlists.models import Playlist, PlaylistTrack
from apps.social.models import Follow
from apps.support.models import Ticket, TicketMessage

DEMO_PASSWORD = "password123"


class Command(BaseCommand):
    """Populates the local dev database with a small, consistent demo dataset —
    a few users of each role, a couple of artists' catalogs, playlists, follows,
    a subscription, a notification and a support ticket. Safe to re-run: every
    object is created with get_or_create/update_or_create keyed on a natural key.
    """

    help = "Seed the database with sample users, catalog, and activity data for local development."

    @transaction.atomic
    def handle(self, *args, **options):
        plans = self._seed_plans()
        users = self._seed_users()
        albums_tracks = self._seed_catalog(users)
        self._seed_playlists(users, albums_tracks)
        self._seed_follows(users)
        self._seed_subscription(users, plans)
        self._seed_notifications(users)
        self._seed_support_ticket(users)

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
        self.stdout.write(f"All seeded accounts share the password: {DEMO_PASSWORD}")
        for email in sorted(u.email for u in users.values()):
            self.stdout.write(f"  - {email}")

    def _seed_plans(self):
        plans = {}
        specs = [
            ("free", 0, 50, 3, {}),
            ("silver", 49000, 300, 15, {"can_download_tracks": True}),
            (
                "gold",
                99000,
                None,
                None,
                {
                    "can_upload_profile_photo": True,
                    "can_download_tracks": True,
                    "early_access_to_releases": True,
                    "can_view_artist_stats": True,
                },
            ),
        ]
        for tier, price, stream_limit, playlist_limit, extra in specs:
            plan, _ = SubscriptionPlan.objects.update_or_create(
                tier=tier,
                defaults={
                    "monthly_price": price,
                    "daily_stream_limit": stream_limit,
                    "playlist_limit": playlist_limit,
                    **extra,
                },
            )
            plans[tier] = plan
        return plans

    def _seed_users(self):
        users = {}

        admin, _ = User.objects.get_or_create(
            email="admin@soundwave.dev",
            defaults={
                "username": _generate_username("admin@soundwave.dev"),
                "role": User.Role.ADMIN,
                "display_name": "Site Admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin.set_password(DEMO_PASSWORD)
        admin.save()
        users["admin"] = admin

        support, _ = User.objects.get_or_create(
            email="support@soundwave.dev",
            defaults={
                "username": _generate_username("support@soundwave.dev"),
                "role": User.Role.SUPPORT,
                "display_name": "Support Agent",
            },
        )
        support.set_password(DEMO_PASSWORD)
        support.save()
        users["support"] = support

        artist_specs = [
            ("artist1@soundwave.dev", "Nova Frost"),
            ("artist2@soundwave.dev", "Echo Valley"),
        ]
        for email, stage_name in artist_specs:
            key = email.split("@")[0]
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": _generate_username(email),
                    "role": User.Role.ARTIST,
                    "display_name": stage_name,
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.save()
            ArtistProfile.objects.update_or_create(
                user=user,
                defaults={
                    "stage_name": stage_name,
                    "bio": f"{stage_name} is a demo artist seeded for local development.",
                    "verification_status": ArtistProfile.VerificationStatus.APPROVED,
                },
            )
            users[key] = user

        listener_specs = [
            ("listener1@soundwave.dev", "Alex Listener"),
            ("listener2@soundwave.dev", "Jordan Listener"),
            ("listener3@soundwave.dev", "Sam Listener"),
        ]
        for email, display_name in listener_specs:
            key = email.split("@")[0]
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": _generate_username(email),
                    "role": User.Role.LISTENER,
                    "display_name": display_name,
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.save()
            users[key] = user

        return users

    def _seed_catalog(self, users):
        catalog = {"albums": [], "tracks": []}

        album_specs = [
            (
                "artist1",
                "Frostbound",
                "album",
                2024,
                "Electronic",
                [("Glacier", 210), ("Aurora Drift", 245), ("Polar Night", 198)],
            ),
            ("artist1", "Solstice", "single", 2025, "Electronic", [("Solstice", 180)]),
            (
                "artist2",
                "Valley Echoes",
                "album",
                2023,
                "Indie Folk",
                [("Riverbend", 220), ("Quiet Hollow", 260), ("Old Pines", 190), ("Homebound", 230)],
            ),
        ]
        for artist_key, title, release_type, year, genre, tracks in album_specs:
            artist_profile = users[artist_key].artist_profile
            album, _ = Album.objects.update_or_create(
                title=title,
                artist_profile=artist_profile,
                defaults={"genre": genre, "release_year": year, "release_type": release_type},
            )
            catalog["albums"].append(album)
            for i, (track_title, duration) in enumerate(tracks, start=1):
                track, _ = Track.objects.update_or_create(
                    title=track_title,
                    album=album,
                    defaults={"duration_seconds": duration, "track_number": i},
                )
                catalog["tracks"].append(track)

        return catalog

    def _seed_playlists(self, users, catalog):
        tracks = catalog["tracks"]
        playlist, _ = Playlist.objects.get_or_create(owner=users["listener1"], name="Chill Mix")
        for position, track in enumerate(tracks[:3], start=1):
            PlaylistTrack.objects.get_or_create(playlist=playlist, track=track, defaults={"position": position})

        playlist2, _ = Playlist.objects.get_or_create(owner=users["listener2"], name="Focus Flow")
        for position, track in enumerate(tracks[3:6], start=1):
            PlaylistTrack.objects.get_or_create(playlist=playlist2, track=track, defaults={"position": position})

    def _seed_follows(self, users):
        follow_pairs = [
            ("listener1", "artist1"),
            ("listener1", "artist2"),
            ("listener2", "artist1"),
            ("listener3", "artist2"),
        ]
        for follower_key, followee_key in follow_pairs:
            Follow.objects.get_or_create(follower=users[follower_key], followee=users[followee_key])

    def _seed_subscription(self, users, plans):
        now = timezone.now()
        Subscription.objects.get_or_create(
            user=users["listener1"],
            plan=plans["gold"],
            status=Subscription.Status.ACTIVE,
            defaults={
                "duration_months": Subscription.Duration.ONE_MONTH,
                "started_at": now,
                "expires_at": now + timedelta(days=30),
                "auto_renew": True,
            },
        )

    def _seed_notifications(self, users):
        Notification.objects.get_or_create(
            user=users["listener1"],
            kind=Notification.Kind.NEW_RELEASE,
            title="Nova Frost released a new single",
            defaults={"body": "Solstice is out now.", "action_url": "/albums/solstice"},
        )
        Notification.objects.get_or_create(
            user=users["artist1"],
            kind=Notification.Kind.ARTIST_VERIFICATION_RESULT,
            title="Your artist profile was approved",
            defaults={"body": "You can now publish albums and tracks."},
        )

    def _seed_support_ticket(self, users):
        ticket, _ = Ticket.objects.get_or_create(
            user=users["listener3"], subject="Can't play tracks on mobile", defaults={"status": Ticket.Status.OPEN}
        )
        TicketMessage.objects.get_or_create(
            ticket=ticket,
            sender=users["listener3"],
            body="Playback stops after a few seconds on my phone.",
        )
        TicketMessage.objects.get_or_create(
            ticket=ticket,
            sender=users["support"],
            body="Thanks for the report — could you tell us your device and app version?",
        )
