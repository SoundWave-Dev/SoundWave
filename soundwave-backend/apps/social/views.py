from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError
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
        data = {
            "follower_count": Follow.objects.filter(followee_id=user_id).count(),
            "following_count": Follow.objects.filter(follower_id=user_id).count(),
            "is_following": Follow.objects.filter(follower=request.user, followee_id=user_id).exists(),
        }
        return Response(FollowStatsSerializer(data).data)


class FollowToggleView(APIView):
    """POST to follow, DELETE to unfollow (spec §2.3/§2.4 Follow/Unfollow button)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if request.user.id == user_id:
            raise ValidationError("You cannot follow yourself.")
        _, created = Follow.objects.get_or_create(follower=request.user, followee_id=user_id)
        return Response(status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, user_id):
        deleted, _ = Follow.objects.filter(follower=request.user, followee_id=user_id).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
