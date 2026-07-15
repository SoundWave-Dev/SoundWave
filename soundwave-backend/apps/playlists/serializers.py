from rest_framework import serializers

from apps.playlists.models import Playlist, PlaylistTrack


class PlaylistTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistTrack
        fields = ["id", "track", "position", "added_at"]


class PlaylistSerializer(serializers.ModelSerializer):
    tracks = PlaylistTrackSerializer(source="playlist_tracks", many=True, read_only=True)
    track_count = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ["id", "name", "tracks", "track_count", "created_at"]
        read_only_fields = ["owner"]

    def get_track_count(self, obj):
        return obj.playlist_tracks.count()


class AddTrackToPlaylistSerializer(serializers.Serializer):
    track_id = serializers.IntegerField()
