from django.conf import settings
from django.db import models


class Playlist(models.Model):
    """Owner is limited by their subscription tier's playlist_limit (spec §2.4/§2.7) —
    enforced in the view, not here, since the limit is admin-editable (apps.billing).
    """

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="playlists")
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class PlaylistTrack(models.Model):
    """Through-table preserving track order within a playlist (spec §2.7)."""

    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="playlist_tracks")
    track = models.ForeignKey("music.Track", on_delete=models.CASCADE, related_name="playlist_entries")
    position = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position"]
        unique_together = ["playlist", "track"]
