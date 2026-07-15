from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.playback.models import UserPreference
from apps.playback.serializers import RecentlyPlayedTrackSerializer, UserPreferenceSerializer


class MyPreferencesView(generics.RetrieveUpdateAPIView):
    """Backs the Settings page (spec §2.5) — replaces the frontend's Local Storage
    prefs so they sync across devices (spec §3.5).
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserPreferenceSerializer

    def get_object(self):
        obj, _created = UserPreference.objects.get_or_create(user=self.request.user)
        return obj


class RecentlyPlayedView(APIView):
    """Feeds `recentlyPlayedIds` into the AI Song Suggester (spec §5.2 / TASKS_ILIYA.md)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # TODO(Iliya): distinct track ids from apps.music.StreamEvent for this user,
        # most recent first, e.g.:
        #   StreamEvent.objects.filter(user=request.user).order_by("-played_at")
        #       .values_list("track_id", flat=True).distinct()[:20]
        raise NotImplementedError
