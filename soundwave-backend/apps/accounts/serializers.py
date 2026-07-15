from rest_framework import serializers

from apps.accounts.models import ArtistProfile, User


class UserSerializer(serializers.ModelSerializer):
    """Read-only profile representation (spec §2.3 User Profile page)."""

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "display_name", "role",
            "avatar", "date_of_birth", "gender", "date_joined",
        ]
        read_only_fields = ["id", "username", "role", "date_joined"]

    # TODO(Foad): add `subscription_tier`, `follower_count`, `following_count`,
    # `daily_stream_count` as SerializerMethodFields once apps.billing/apps.social exist.


class ListenerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    accept_privacy_policy = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "password", "confirm_password", "display_name",
            "date_of_birth", "gender", "accept_privacy_policy",
        ]

    def validate(self, attrs):
        # TODO(Foad): confirm_password == password, accept_privacy_policy must be True
        raise NotImplementedError

    def create(self, validated_data):
        # TODO(Foad): pop confirm_password/accept_privacy_policy, set role=LISTENER,
        # generate system username, hash password via User.objects.create_user
        raise NotImplementedError


class ArtistRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    stage_name = serializers.CharField()
    portfolio_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "stage_name", "portfolio_url"]

    def create(self, validated_data):
        # TODO(Foad): create User(role=ARTIST) + ArtistProfile(status=PENDING) in one transaction
        raise NotImplementedError


class ArtistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistProfile
        fields = [
            "id", "user", "stage_name", "bio", "portfolio_url",
            "verification_status", "rejection_reason", "reviewed_at",
        ]
        read_only_fields = ["verification_status", "rejection_reason", "reviewed_at"]


class ForgotPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    # TODO(Foad): look up user, generate a reset token (django's PasswordResetTokenGenerator
    # is fine), email it. Always return 200 regardless of whether the email exists.


class ForgotPasswordConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
