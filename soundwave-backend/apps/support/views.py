from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import ArtistProfile, User
from apps.accounts.permissions import IsSupportOrAdmin
from apps.notifications.models import Notification
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
        ticket = serializer.save(user=self.request.user)

        staff = User.objects.filter(role__in=[User.Role.SUPPORT, User.Role.ADMIN])
        Notification.objects.bulk_create(
            [
                Notification(
                    user=staff_user,
                    kind=Notification.Kind.NEW_TICKET,
                    title="New support ticket",
                    body=f'"{ticket.subject}" from {self.request.user.username}',
                    action_url=f"/support/tickets/{ticket.id}",
                )
                for staff_user in staff
            ]
        )

    @action(detail=True, methods=["get", "post"])
    def messages(self, request, pk=None):
        """GET lists the ticket's chat thread; POST appends a message (chatbox UI)."""
        ticket = self.get_object()

        if request.method == "GET":
            thread = ticket.messages.select_related("sender")
            return Response(TicketMessageSerializer(thread, many=True).data)

        serializer = TicketMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ticket=ticket, sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ArtistVerificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Support/admin review queue for pending artist accounts (spec §2.11.1)."""

    serializer_class = ArtistVerificationRequestSerializer
    permission_classes = [IsSupportOrAdmin]
    queryset = ArtistProfile.objects.filter(verification_status=ArtistProfile.VerificationStatus.PENDING)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        artist_profile = self.get_object()
        artist_profile.verification_status = ArtistProfile.VerificationStatus.APPROVED
        artist_profile.rejection_reason = ""
        artist_profile.reviewed_by = request.user
        artist_profile.reviewed_at = timezone.now()
        artist_profile.save(update_fields=["verification_status", "rejection_reason", "reviewed_by", "reviewed_at"])

        Notification.objects.create(
            user=artist_profile.user,
            kind=Notification.Kind.ARTIST_VERIFICATION_RESULT,
            title="Artist verification approved",
            body="Your artist account has been approved. You can now publish music.",
        )
        return Response(ArtistVerificationRequestSerializer(artist_profile).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        artist_profile = self.get_object()
        serializer = ArtistVerificationRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        artist_profile.verification_status = ArtistProfile.VerificationStatus.REJECTED
        artist_profile.rejection_reason = serializer.validated_data["reason"]
        artist_profile.reviewed_by = request.user
        artist_profile.reviewed_at = timezone.now()
        artist_profile.save(update_fields=["verification_status", "rejection_reason", "reviewed_by", "reviewed_at"])

        Notification.objects.create(
            user=artist_profile.user,
            kind=Notification.Kind.ARTIST_VERIFICATION_RESULT,
            title="Artist verification rejected",
            body=serializer.validated_data["reason"],
        )
        return Response(ArtistVerificationRequestSerializer(artist_profile).data)
