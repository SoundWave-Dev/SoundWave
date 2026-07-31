from django.db.models import Max
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.accounts.permissions import IsOwner
from apps.billing.models import Subscription
from apps.playlists.models import Playlist, PlaylistTrack
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
        user = self.request.user
        subscription = (
            Subscription.objects.filter(user=user, status=Subscription.Status.ACTIVE)
            .select_related("plan")
            .first()
        )
        playlist_limit = subscription.plan.playlist_limit if subscription else None
        if playlist_limit is not None and Playlist.objects.filter(owner=user).count() >= playlist_limit:
            raise ValidationError(
                f"Your current plan allows a maximum of {playlist_limit} playlists. "
                "Upgrade your subscription to create more."
            )
        serializer.save(owner=user)

    @action(detail=True, methods=["post"], url_path="tracks")
    def add_track(self, request, pk=None):
        playlist = self.get_object()
        serializer = AddTrackToPlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        track_id = serializer.validated_data["track_id"]

        next_position = (playlist.playlist_tracks.aggregate(Max("position"))["position__max"] or 0) + 1
        _, created = PlaylistTrack.objects.get_or_create(
            playlist=playlist, track_id=track_id, defaults={"position": next_position}
        )
        return Response(
            PlaylistSerializer(playlist).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=True, methods=["delete"], url_path="tracks/(?P<track_id>[^/.]+)")
    def remove_track(self, request, pk=None, track_id=None):
        playlist = self.get_object()
        deleted, _ = PlaylistTrack.objects.filter(playlist=playlist, track_id=track_id).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
