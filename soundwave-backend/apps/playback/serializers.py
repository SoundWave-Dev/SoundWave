from rest_framework import serializers

from apps.music.models import Track
from apps.playback.models import UserPreference


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            "language", "system_volume", "notify_new_releases",
            "notify_subscription", "notify_artist_verification", "notify_tickets",
        ]


class RecentlyPlayedTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ["id", "title", "album"]
