from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


class NotificationViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """List/delete only — notifications aren't created via this API (spec §3.1 note:
    don't add PUT/PATCH/POST where it isn't a logical operation on the resource).
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        # TODO(Foad): notification = self.get_object(); notification.is_read = True; notification.save()
        raise NotImplementedError

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        # TODO(Foad): self.get_queryset().update(is_read=True)
        raise NotImplementedError
