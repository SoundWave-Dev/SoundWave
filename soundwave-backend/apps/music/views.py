from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsApprovedArtist
from apps.music.models import Album, Track
from apps.music.serializers import AlbumSerializer, StreamEventCreateSerializer, TrackSerializer


class AlbumViewSet(viewsets.ModelViewSet):
    """Public read (library/search, spec §2.8); write restricted to the owning artist
    (spec §2.10 artist management panel).
    """

    serializer_class = AlbumSerializer
    queryset = Album.objects.select_related("artist_profile").prefetch_related("tracks")
    filterset_fields = ["genre", "release_type", "artist_profile"]
    search_fields = ["title", "artist_profile__stage_name"]
    ordering_fields = ["release_year", "created_at"]  # TODO(Iliya): add a `listener_count` annotation to sort by

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsApprovedArtist()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # TODO(Iliya): serializer.save(artist_profile=self.request.user.artist_profile)
        raise NotImplementedError

    def perform_update(self, serializer):
        # TODO(Iliya): assert serializer.instance.artist_profile.user == self.request.user before saving
        raise NotImplementedError


class TrackViewSet(viewsets.ModelViewSet):
    serializer_class = TrackSerializer
    queryset = Track.objects.select_related("album", "album__artist_profile")
    search_fields = ["title", "album__artist_profile__stage_name"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsApprovedArtist()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=["post"])
    def stream(self, request, pk=None):
        """Logs a play — called by the frontend player on track start (spec §2.9).
        Also respects the daily stream limit for Free-tier users (spec §2.4 table).
        """
        # TODO(Iliya): check request.user's remaining daily_stream_limit (apps.billing),
        # then StreamEvent.objects.create(track_id=pk, user=request.user)
        raise NotImplementedError
