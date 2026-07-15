from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import ArtistProfile
from apps.accounts.permissions import IsSupportOrAdmin
from apps.support.models import Ticket, TicketMessage
from apps.support.serializers import (
    ArtistVerificationRejectSerializer,
    ArtistVerificationRequestSerializer,
    TicketMessageSerializer,
    TicketSerializer,
)


class TicketViewSet(viewsets.ModelViewSet):
    """Listeners/artists see + create their own tickets; support/admin see all (spec §2.11.1)."""

    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head"]  # no PUT/PATCH/DELETE on a ticket itself

    def get_queryset(self):
        user = self.request.user
        if user.role in ("support", "admin"):
            return Ticket.objects.all()
        return Ticket.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get", "post"])
    def messages(self, request, pk=None):
        # TODO(Iliya-not-owned / Foad): GET -> list TicketMessage for this ticket;
        # POST -> create TicketMessage(sender=request.user), used by the chatbox UI.
        raise NotImplementedError


class ArtistVerificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Support/admin review queue for pending artist accounts (spec §2.11.1)."""

    serializer_class = ArtistVerificationRequestSerializer
    permission_classes = [IsSupportOrAdmin]
    queryset = ArtistProfile.objects.filter(verification_status=ArtistProfile.VerificationStatus.PENDING)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        # TODO(Foad): set status=APPROVED, reviewed_by=request.user, reviewed_at=now(),
        # create a Notification(kind=ARTIST_VERIFICATION_RESULT) for the artist.
        raise NotImplementedError

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        serializer = ArtistVerificationRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO(Foad): set status=REJECTED, rejection_reason=serializer.validated_data["reason"], notify artist.
        raise NotImplementedError
