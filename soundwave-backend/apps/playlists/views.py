from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsOwner
from apps.playlists.models import Playlist
from apps.playlists.serializers import AddTrackToPlaylistSerializer, PlaylistSerializer


class PlaylistViewSet(viewsets.ModelViewSet):
    """Spec §2.7 — create/rename/delete + manage tracks. The playlist-count limit per
    tier (free=6, silver=100, gold=unlimited) is read from apps.billing.SubscriptionPlan,
    never hard-coded (spec §2.4/§3.2).
    """

    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Playlist.objects.filter(owner=self.request.user).prefetch_related("playlist_tracks")

    def perform_create(self, serializer):
        # TODO(Rayan): before saving, check self.request.user's active subscription's
        # playlist_limit against Playlist.objects.filter(owner=request.user).count();
        # raise a 403/400 with a clear message if the limit is reached (frontend shows
        # this as a disabled button + tooltip, so the API error should be descriptive).
        raise NotImplementedError

    @action(detail=True, methods=["post"], url_path="tracks")
    def add_track(self, request, pk=None):
        serializer = AddTrackToPlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO(Rayan): PlaylistTrack.objects.create(playlist=self.get_object(), track_id=..., position=next)
        raise NotImplementedError

    @action(detail=True, methods=["delete"], url_path="tracks/(?P<track_id>[^/.]+)")
    def remove_track(self, request, pk=None, track_id=None):
        # TODO(Rayan): PlaylistTrack.objects.filter(playlist=self.get_object(), track_id=track_id).delete()
        raise NotImplementedError
