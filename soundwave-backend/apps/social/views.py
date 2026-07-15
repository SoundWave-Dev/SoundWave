from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.social.models import Follow
from apps.social.serializers import FollowStatsSerializer


class FollowStatsView(APIView):
    """GET /social/users/{id}/follow-stats/ — backs the profile page's follower/
    following counts + whether the current user already follows them (spec §2.3/§2.4).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        # TODO(Rayan): Follow.objects.filter(followee_id=user_id).count(), etc.
        raise NotImplementedError


class FollowToggleView(APIView):
    """POST to follow, DELETE to unfollow (spec §2.3/§2.4 Follow/Unfollow button)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        # TODO(Rayan): Follow.objects.get_or_create(follower=request.user, followee_id=user_id)
        # reject if user_id == request.user.id
        raise NotImplementedError

    def delete(self, request, user_id):
        # TODO(Rayan): Follow.objects.filter(follower=request.user, followee_id=user_id).delete()
        raise NotImplementedError
