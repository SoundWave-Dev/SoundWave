import os

from rest_framework import serializers

from apps.music.models import Album, StreamEvent, Track
from apps.music.utils import get_active_plan

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac"}


class TrackSerializer(serializers.ModelSerializer):
    stream_count = serializers.SerializerMethodField()
    unique_listeners = serializers.SerializerMethodField()
    # Convenience read-only fields so the frontend can render a track card without an
    # extra request per track for its album's title/cover/genre/year or artist names.
    album_title = serializers.CharField(source="album.title", read_only=True)
    album_cover = serializers.ImageField(source="album.cover_image", read_only=True)
    genre = serializers.CharField(source="album.genre", read_only=True)
    release_year = serializers.IntegerField(source="album.release_year", read_only=True)
    artists = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = [
            "id", "title", "album", "album_title", "album_cover", "genre", "release_year",
            "collaborators", "artists", "audio_file", "lyrics", "duration_seconds",
            "track_number", "stream_count", "unique_listeners",
        ]

    def get_artists(self, obj):
        primary = obj.album.artist_profile
        seen = {primary.id}
        artists = [{"id": primary.id, "stage_name": primary.stage_name}]
        for collaborator in obj.collaborators.all():
            if collaborator.id not in seen:
                seen.add(collaborator.id)
                artists.append({"id": collaborator.id, "stage_name": collaborator.stage_name})
        return artists

    def get_stream_count(self, obj):
        if hasattr(obj, "annotated_stream_count"):
            return obj.annotated_stream_count
        return obj.stream_events.count()

    def get_unique_listeners(self, obj):
        # spec §2.9: Gold subscribers (SubscriptionPlan.can_view_artist_stats) see this on
        # any track; the track's own artist/collaborators always see it on their own
        # tracks regardless of their personal subscription tier (spec §2.10 stats panel).
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not (user and user.is_authenticated):
            return None

        artist_profile = getattr(user, "artist_profile", None)
        is_owner = artist_profile is not None and (
            obj.album.artist_profile_id == artist_profile.id
            or obj.collaborators.filter(pk=artist_profile.id).exists()
        )
        if not is_owner:
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
    artists = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = [
            "id", "title", "artist_profile", "artist_stage_name", "artists", "cover_image",
            "genre", "release_year", "release_type", "tracks", "created_at",
        ]
        read_only_fields = ["artist_profile"]

    def get_artists(self, obj):
        return [{"id": obj.artist_profile_id, "stage_name": obj.artist_profile.stage_name}]


class StreamEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamEvent
        fields = ["track"]
