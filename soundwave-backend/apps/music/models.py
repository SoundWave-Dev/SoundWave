from django.db import models


class Album(models.Model):
    """Represents both albums and singles (spec §2.10 "Type: Single or Album").
    A single is just an Album with `release_type=SINGLE` holding exactly one Track —
    this avoids a parallel "standalone track" model per spec §3.1's "no more models
    than needed" guidance.
    """

    class ReleaseType(models.TextChoices):
        SINGLE = "single", "Single"
        ALBUM = "album", "Album"

    title = models.CharField(max_length=200)
    artist_profile = models.ForeignKey(
        "accounts.ArtistProfile", on_delete=models.CASCADE, related_name="albums"
    )
    cover_image = models.ImageField(upload_to="covers/albums/", null=True, blank=True)
    genre = models.CharField(max_length=100, blank=True)
    release_year = models.PositiveSmallIntegerField()
    release_type = models.CharField(max_length=16, choices=ReleaseType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Track(models.Model):
    title = models.CharField(max_length=200)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name="tracks")
    collaborators = models.ManyToManyField(
        "accounts.ArtistProfile", blank=True, related_name="collaborated_tracks"
    )
    audio_file = models.FileField(upload_to="tracks/audio/")  # mp3/wav/flac — validated in serializer
    lyrics = models.TextField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    track_number = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["album_id", "track_number"]

    @property
    def artist_profile(self):
        return self.album.artist_profile

    def __str__(self):
        return self.title


class StreamEvent(models.Model):
    """One row per play — source of truth for stream_count, unique_listeners (spec
    §2.9/§2.11.2), and the "recently played" / Top Tracks sections. Aggregation is
    always done here in the backend (spec §3.7), never by shipping raw rows to the
    frontend.
    """

    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="stream_events")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="stream_events")
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["track", "user"])]
