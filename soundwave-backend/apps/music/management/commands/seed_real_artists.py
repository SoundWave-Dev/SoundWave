import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from apps.accounts.models import ArtistProfile, User
from apps.accounts.serializers import _generate_username
from apps.music.models import Album, Track

DEMO_PASSWORD = "password123"

# Real audio the user placed under media/tracks/*.mp3 (with matching *.png covers) —
# this command is NOT part of seed_demo_data because it depends on files that only
# exist on this machine (media/ is gitignored, never committed).
SOURCE_DIR = Path(settings.BASE_DIR) / "media" / "tracks"
AUDIO_DEST = Path(settings.MEDIA_ROOT) / "tracks" / "audio"
COVER_DEST = Path(settings.MEDIA_ROOT) / "covers" / "albums"

ARTISTS = {
    "dariush": {"email": "dariush@soundwave.dev", "stage_name": "Dariush", "genre": "Persian Rock"},
    "ebi": {"email": "ebi@soundwave.dev", "stage_name": "Ebi", "genre": "Persian Pop"},
    "googoosh": {"email": "googoosh@soundwave.dev", "stage_name": "Googoosh", "genre": "Persian Pop"},
}

_COLLAB_LYRICS = (
    "اگر چه جایِ دل دریای خون در سینه دارم ولی در عشق تو دریائی از دل کم میارم\n"
    "اگر چه روبروئی مثل آئینه با من ولی چشمهام بَسَم نیست برای سیر دیدن\n"
    "نه یک دل نه هزار دل همه دل های عالم همه دل ها رو میخوام که عاشق تو باشم"
)

# (artist_key, album_title, release_year, [(track_title, source_mp3, source_cover_or_None, duration_seconds, lyrics_or_None), ...])
CATALOG = [
    ("dariush", "Cheshme Man", 1991, [
        ("Dastaye To", "03 Dastaye To.mp3", "03 Dastaye To.png", 217, None),
    ]),
    ("dariush", "Nazanin", 2008, [
        ("Niyayesh", "06 - Dariush - Niyayesh.mp3", "06 - Dariush - Niyayesh.png", 364, None),
    ]),
    ("dariush", "Be Man Nagoo Dooset Daram", 1991, [
        ("Hasood", "Dariush - Hasood.mp3", "Dariush - Hasood.png", 239, None),
        ("Jashne Deltangi", "Dariush - Jashne Deltangi.mp3", "Dariush - Jashne Deltangi.png", 311, None),
    ]),
    ("dariush", "40 Golden Hits of Dariush", 2008, [
        ("Shahre Gham", "Dariush - Shahre Gham.mp3", "Dariush - Shahre Gham.png", 220, None),
    ]),
    ("dariush", "Gole Bita", 2012, [
        ("Shame Mahtab", "Dariush - Shame Mahtab.mp3", "Dariush - Shame Mahtab.png", 322, None),
    ]),
    ("ebi", "Bar Faraze Asemanha", 2010, [
        ("Bar Faraze Asemanha", "Ebi – Bar Faraze Asemanha.mp3", "Ebi – Bar Faraze Asemanha.png", 180, None),
    ]),
    ("ebi", "Singles", 2015, [
        ("Ebi, Behrooz & Googoosh", "ebi-Ebi-Behrooz-Gogosh-128.mp3", "ebi-Ebi-Behrooz-Gogosh-128.png", 264, _COLLAB_LYRICS),
    ]),
    ("ebi", "Atre To", 2000, [
        ("Geryeh Nakon", "Ebi-Gerye Nakon.mp3", "Ebi-Gerye Nakon.png", 285, None),
    ]),
    ("ebi", "Asal", 1979, [
        ("Khali", "Ebi - Khali.mp3", "Ebi - Khali.png", 304, None),
    ]),
    ("googoosh", "E'jaz", 2018, [
        ("Nagoo Bedroud", "06 Nagoo Bedroud.mp3", "06 Nagoo Bedroud.png", 210, None),
    ]),
    ("googoosh", "Volume 3", 1998, [
        ("Gharibe Ashena", "gharibe ashena.mp3", "gharibe ashena.png", 237, None),
    ]),
    ("googoosh", "Kooh", 2013, [
        ("Kooh", "Googoosh – Kooh.mp3", "Googoosh – Kooh.png", 172, None),
        ("Makhloogh", "Googoosh-Makhloogh-320.mp3", "Googoosh-Makhloogh-320.png", 236, None),
    ]),
    ("googoosh", "2Mahi", 2003, [
        ("Shenhaye Saheli", "Googoosh-Shenhaye-Saheli-128.mp3", "Googoosh-Shenhaye-Saheli-128.png", 156, None),
    ]),
    ("googoosh", "Singles", 2000, [
        ("Nemidouni", "Nemidooni - Googoosh.mp3", None, 232, None),
    ]),
]

# gharibe ashena is a well-known Dariush/Googoosh duet — credit both.
_COLLABORATOR_TRACKS = {("googoosh", "Gharibe Ashena"): ["dariush"]}


class Command(BaseCommand):
    """One-off local seeding: catalogs the real Dariush/Ebi/Googoosh MP3s + cover
    art the user placed under media/tracks/*.mp3 into proper Artist/Album/Track
    rows, copying each file into the storage locations Track.audio_file and
    Album.cover_image expect. Requires those source files to exist locally —
    not runnable on a teammate's machine, unlike seed_demo_data.
    """

    help = "Seed real Dariush/Ebi/Googoosh catalog data from media/tracks/*.mp3 (local files only)."

    @transaction.atomic
    def handle(self, *args, **options):
        missing = sorted(
            {mp3 for _, _, _, tracks in CATALOG for _, mp3, _, _, _ in tracks if not (SOURCE_DIR / mp3).exists()}
        )
        if missing:
            raise CommandError(f"Missing source file(s) under {SOURCE_DIR}: {missing}")

        AUDIO_DEST.mkdir(parents=True, exist_ok=True)
        COVER_DEST.mkdir(parents=True, exist_ok=True)

        artists = self._seed_artists()

        album_count = track_count = 0
        for artist_key, album_title, year, tracks in CATALOG:
            artist_profile = artists[artist_key]
            release_type = Album.ReleaseType.SINGLE if len(tracks) == 1 else Album.ReleaseType.ALBUM

            album, _ = Album.objects.update_or_create(
                title=album_title,
                artist_profile=artist_profile,
                defaults={
                    "genre": ARTISTS[artist_key]["genre"],
                    "release_year": year,
                    "release_type": release_type,
                },
            )
            cover_source = tracks[0][2]
            if cover_source:
                self._attach_cover(album, artist_key, album_title, cover_source)
            album_count += 1

            for i, (track_title, mp3_name, cover_name, duration, lyrics) in enumerate(tracks, start=1):
                track, _ = Track.objects.update_or_create(
                    title=track_title,
                    album=album,
                    defaults={"duration_seconds": duration, "track_number": i, "lyrics": lyrics or ""},
                )
                self._attach_audio(track, artist_key, track_title, mp3_name)
                for collaborator_key in _COLLABORATOR_TRACKS.get((artist_key, track_title), []):
                    track.collaborators.add(artists[collaborator_key])
                track_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {album_count} album(s), {track_count} track(s)."))

    def _seed_artists(self):
        profiles = {}
        for key, info in ARTISTS.items():
            user, _ = User.objects.get_or_create(
                email=info["email"],
                defaults={
                    "username": _generate_username(info["email"]),
                    "role": User.Role.ARTIST,
                    "display_name": info["stage_name"],
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.save()
            profile, _ = ArtistProfile.objects.update_or_create(
                user=user,
                defaults={
                    "stage_name": info["stage_name"],
                    "verification_status": ArtistProfile.VerificationStatus.APPROVED,
                },
            )
            profiles[key] = profile
        return profiles

    def _attach_audio(self, track, artist_key, track_title, source_name):
        dest_name = f"{artist_key}-{slugify(track_title)}.mp3"
        shutil.copyfile(SOURCE_DIR / source_name, AUDIO_DEST / dest_name)
        track.audio_file.name = f"tracks/audio/{dest_name}"
        track.save(update_fields=["audio_file"])

    def _attach_cover(self, album, artist_key, album_title, source_name):
        dest_name = f"{artist_key}-{slugify(album_title)}.png"
        shutil.copyfile(SOURCE_DIR / source_name, COVER_DEST / dest_name)
        album.cover_image.name = f"covers/albums/{dest_name}"
        album.save(update_fields=["cover_image"])
