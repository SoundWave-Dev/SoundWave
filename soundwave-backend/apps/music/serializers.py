import os

from rest_framework import serializers

from apps.music.models import Album, StreamEvent, Track
from apps.music.utils import get_active_plan

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac"}


class TrackSerializer(serializers.ModelSerializer):
    stream_count = serializers.SerializerMethodField()
    unique_listeners = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = [
            "id", "title", "album", "collaborators", "audio_file",
            "lyrics", "duration_seconds", "track_number", "stream_count", "unique_listeners",
        ]

    def get_stream_count(self, obj):
        if hasattr(obj, "annotated_stream_count"):
            return obj.annotated_stream_count
        return obj.stream_events.count()

    def get_unique_listeners(self, obj):
        # spec §2.9: only Gold subscribers (SubscriptionPlan.can_view_artist_stats) see this.
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not (user and user.is_authenticated):
            return None
        plan = get_active_plan(user)
        if not (plan and plan.can_view_artist_stats):
            return None
        if hasattr(obj, "annotated_unique_listeners"):
            return obj.annotated_unique_listeners
        return obj.stream_events.values("user").distinct().count()

    def validate_audio_file(self, value):
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_AUDIO_EXTENSIONS:
            raise serializers.ValidationError(
                f"Unsupported audio format '{ext}'. Allowed formats: mp3, wav, flac."
            )
        return value


class AlbumSerializer(serializers.ModelSerializer):
    tracks = TrackSerializer(many=True, read_only=True)
    artist_stage_name = serializers.CharField(source="artist_profile.stage_name", read_only=True)

    class Meta:
        model = Album
        fields = [
            "id", "title", "artist_profile", "artist_stage_name", "cover_image",
            "genre", "release_year", "release_type", "tracks", "created_at",
        ]
        read_only_fields = ["artist_profile"]


class StreamEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamEvent
        fields = ["track"]
