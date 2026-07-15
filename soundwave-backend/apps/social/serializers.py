from rest_framework import serializers

from apps.social.models import Follow


class FollowStatsSerializer(serializers.Serializer):
    """Aggregated-only — spec §3.7 says never dump raw follower lists to the frontend
    unless a page actually needs the list (profile page only needs counts, spec §2.3).
    """

    follower_count = serializers.IntegerField()
    following_count = serializers.IntegerField()
    is_following = serializers.BooleanField()
