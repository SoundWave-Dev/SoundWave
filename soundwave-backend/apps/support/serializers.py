from rest_framework import serializers

from apps.accounts.models import ArtistProfile
from apps.support.models import Ticket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_role = serializers.CharField(source="sender.role", read_only=True)

    class Meta:
        model = TicketMessage
        fields = ["id", "ticket", "sender", "sender_role", "body", "created_at"]
        read_only_fields = ["ticket", "sender", "sender_role", "created_at"]


class TicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    user_display_name = serializers.CharField(source="user.display_name", read_only=True)

    class Meta:
        model = Ticket
        fields = ["id", "user", "username", "user_display_name", "subject", "status", "created_at"]
        read_only_fields = ["user", "status", "created_at"]


class ArtistVerificationRequestSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ArtistProfile
        fields = ["id", "stage_name", "email", "portfolio_url", "verification_status", "created_at"]
        read_only_fields = fields


class ArtistVerificationRejectSerializer(serializers.Serializer):
    reason = serializers.CharField()
