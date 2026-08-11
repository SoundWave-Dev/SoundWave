from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.accounts.permissions import IsApprovedArtist
from apps.music.models import Album, StreamEvent, Track
from apps.music.serializers import AlbumSerializer, TrackSerializer
from apps.music.utils import get_active_plan


class AlbumViewSet(viewsets.ModelViewSet):
    """Public read (library/search, spec §2.8); write restricted to the owning artist
    (spec §2.10 artist management panel).
    """

    serializer_class = AlbumSerializer
    queryset = (
        Album.objects.select_related("artist_profile")
        .prefetch_related("tracks")
        .annotate(listener_count=Count("tracks__stream_events__user", distinct=True))
        .order_by("-created_at")  # annotate() drops Album.Meta.ordering — restore it explicitly
    )
    filterset_fields = ["genre", "release_type", "artist_profile"]
    search_fields = ["title", "artist_profile__stage_name"]
    ordering_fields = ["release_year", "created_at", "listener_count"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsApprovedArtist()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(artist_profile=self.request.user.artist_profile)

    def perform_update(self, serializer):
        if serializer.instance.artist_profile.user != self.request.user:
            raise PermissionDenied("You can only edit your own albums.")
        serializer.save()


class TrackViewSet(viewsets.ModelViewSet):
    serializer_class = TrackSerializer
    queryset = (
        Track.objects.select_related("album", "album__artist_profile")
        .annotate(
            annotated_stream_count=Count("stream_events", distinct=False),
            annotated_unique_listeners=Count("stream_events__user", distinct=True),
        )
        .order_by("album_id", "track_number")  # annotate() drops Track.Meta.ordering — restore it explicitly
    )
    search_fields = ["title", "album__artist_profile__stage_name"]
    ordering_fields = ["album__release_year", "annotated_unique_listeners"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsApprovedArtist()]
        if self.action == "stream":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        album = serializer.validated_data.get("album")
        if album is None or album.artist_profile.user != self.request.user:
            raise PermissionDenied("You can only add tracks to your own albums.")
        serializer.save()

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.album.artist_profile.user != self.request.user:
            raise PermissionDenied("You can only edit your own tracks.")
        new_album = serializer.validated_data.get("album")
        if new_album is not None and new_album.artist_profile.user != self.request.user:
            raise PermissionDenied("You cannot move a track to another artist's album.")
        serializer.save()

    @action(detail=True, methods=["post"])
    def stream(self, request, pk=None):
        """Logs a play — called by the frontend player on track start (spec §2.9).
        Also respects the daily stream limit for Free-tier users (spec §2.4 table).
        """
        track = self.get_object()
        user = request.user

        plan = get_active_plan(user)
        daily_limit = plan.daily_stream_limit if plan else None
        if daily_limit is not None:
            since = timezone.now() - timedelta(days=1)
            streamed_today = StreamEvent.objects.filter(user=user, played_at__gte=since).count()
            if streamed_today >= daily_limit:
                raise ValidationError(
                    "You've reached your daily stream limit. Upgrade your subscription to keep listening."
                )

        StreamEvent.objects.create(track=track, user=user)
        return Response(status=status.HTTP_201_CREATED)
