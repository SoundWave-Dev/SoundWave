from rest_framework import serializers

from apps.music.models import Album, StreamEvent, Track


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
        # TODO(Iliya): obj.stream_events.count() — consider annotating in the queryset instead
        # of N+1-querying per row (see ViewSet.get_queryset in views.py).
        raise NotImplementedError

    def get_unique_listeners(self, obj):
        # TODO(Iliya): only expose this to Gold subscribers — spec §2.9 "gold users see
        # unique listener + stream stats"; check request.user's subscription in to_representation.
        raise NotImplementedError

    def validate_audio_file(self, value):
        # TODO(Iliya): enforce mp3/wav/flac extension per spec §2.10
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
