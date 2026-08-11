import re

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import ArtistProfile, User


def _generate_username(email):
    """System-assigned username derived from the email's local part (spec §2.1/§2.3
    — users log in with email but see a distinct system-assigned username on their profile).
    """
    base = re.sub(r"[^a-zA-Z0-9_]", "", email.split("@")[0]).lower() or "user"
    username = base
    suffix = 1
    while User.objects.filter(username=username).exists():
        suffix += 1
        username = f"{base}{suffix}"
    return username


class UserSerializer(serializers.ModelSerializer):
    """Read-only profile representation (spec §2.3 User Profile page)."""

    subscription_tier = serializers.SerializerMethodField()
    subscription_expires_at = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    daily_stream_count = serializers.SerializerMethodField()
    artist_id = serializers.SerializerMethodField()
    artist_verification_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "display_name", "role",
            "avatar", "date_of_birth", "gender", "date_joined",
            "subscription_tier", "subscription_expires_at", "follower_count", "following_count",
            "daily_stream_count", "artist_id", "artist_verification_status",
        ]
        read_only_fields = ["id", "username", "role", "date_joined"]

    def _active_subscription(self, obj):
        if not hasattr(self, "_subscription_cache"):
            from apps.billing.models import Subscription

            self._subscription_cache = (
                Subscription.objects.filter(user=obj, status=Subscription.Status.ACTIVE)
                .select_related("plan")
                .order_by("-expires_at")
                .first()
            )
        return self._subscription_cache

    def get_subscription_tier(self, obj):
        from apps.billing.models import SubscriptionPlan

        subscription = self._active_subscription(obj)
        return subscription.plan.tier if subscription else SubscriptionPlan.Tier.FREE

    def get_subscription_expires_at(self, obj):
        subscription = self._active_subscription(obj)
        return subscription.expires_at if subscription else None

    def get_follower_count(self, obj):
        from apps.social.models import Follow

        return Follow.objects.filter(followee=obj).count()

    def get_following_count(self, obj):
        from apps.social.models import Follow

        return Follow.objects.filter(follower=obj).count()

    def get_daily_stream_count(self, obj):
        from datetime import timedelta

        from apps.music.models import StreamEvent

        since = timezone.now() - timedelta(days=1)
        return StreamEvent.objects.filter(user=obj, played_at__gte=since).count()

    def get_artist_id(self, obj):
        profile = getattr(obj, "artist_profile", None)
        return profile.id if profile else None

    def get_artist_verification_status(self, obj):
        profile = getattr(obj, "artist_profile", None)
        return profile.verification_status if profile else None


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
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if not attrs.get("accept_privacy_policy"):
            raise serializers.ValidationError(
                {"accept_privacy_policy": "You must accept the privacy policy to register."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        validated_data.pop("accept_privacy_policy")
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        return User.objects.create_user(
            email=email,
            password=password,
            username=_generate_username(email),
            role=User.Role.LISTENER,
            accepted_privacy_policy_at=timezone.now(),
            **validated_data,
        )


class ArtistRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    stage_name = serializers.CharField()
    portfolio_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "stage_name", "portfolio_url"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        stage_name = validated_data.pop("stage_name")
        portfolio_url = validated_data.pop("portfolio_url", "")
        email = validated_data.pop("email")

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=password,
                username=_generate_username(email),
                role=User.Role.ARTIST,
            )
            ArtistProfile.objects.create(
                user=user,
                stage_name=stage_name,
                portfolio_url=portfolio_url,
                verification_status=ArtistProfile.VerificationStatus.PENDING,
            )

            from apps.notifications.models import Notification

            staff = User.objects.filter(role__in=[User.Role.SUPPORT, User.Role.ADMIN])
            Notification.objects.bulk_create(
                [
                    Notification(
                        user=staff_user,
                        kind=Notification.Kind.NEW_ARTIST_REQUEST,
                        title="New artist verification request",
                        body=f'"{stage_name}" has requested artist verification.',
                        action_url="/support/artist-verifications",
                    )
                    for staff_user in staff
                ]
            )

        # Transient (unsaved) attributes so the response can serialize `stage_name`/
        # `portfolio_url` even though they live on ArtistProfile, not User.
        user.stage_name = stage_name
        user.portfolio_url = portfolio_url
        return user


class PublicUserSerializer(serializers.ModelSerializer):
    """Public `/profile/[username]` page (spec §2.3) — deliberately excludes private
    fields (email, gender, date_of_birth) that UserSerializer exposes for `/me/`.
    """

    subscription_tier = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    daily_stream_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "display_name", "role", "avatar",
            "subscription_tier", "follower_count", "following_count", "daily_stream_count", "date_joined",
        ]
        read_only_fields = fields

    def get_subscription_tier(self, obj):
        from apps.billing.models import Subscription, SubscriptionPlan

        subscription = (
            Subscription.objects.filter(user=obj, status=Subscription.Status.ACTIVE)
            .select_related("plan")
            .order_by("-expires_at")
            .first()
        )
        return subscription.plan.tier if subscription else SubscriptionPlan.Tier.FREE

    def get_follower_count(self, obj):
        from apps.social.models import Follow

        return Follow.objects.filter(followee=obj).count()

    def get_following_count(self, obj):
        from apps.social.models import Follow

        return Follow.objects.filter(follower=obj).count()

    def get_daily_stream_count(self, obj):
        from datetime import timedelta

        from apps.music.models import StreamEvent

        since = timezone.now() - timedelta(days=1)
        return StreamEvent.objects.filter(user=obj, played_at__gte=since).count()


class ArtistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistProfile
        fields = [
            "id", "user", "stage_name", "bio", "portfolio_url",
            "verification_status", "rejection_reason", "reviewed_at",
        ]
        read_only_fields = ["verification_status", "rejection_reason", "reviewed_at"]


class PublicArtistProfileSerializer(serializers.ModelSerializer):
    """Backs the public `/artist/[id]` page — approved artists only (spec §2.3/§2.4)."""

    user_id = serializers.IntegerField(source="user.id", read_only=True)
    avatar = serializers.ImageField(source="user.avatar", read_only=True)
    follower_count = serializers.SerializerMethodField()
    total_streams = serializers.SerializerMethodField()
    total_listeners = serializers.SerializerMethodField()

    class Meta:
        model = ArtistProfile
        fields = [
            "id", "user_id", "stage_name", "bio", "avatar", "verification_status",
            "follower_count", "total_streams", "total_listeners", "created_at",
        ]
        read_only_fields = fields

    def get_follower_count(self, obj):
        from apps.social.models import Follow

        return Follow.objects.filter(followee_id=obj.user_id).count()

    def get_total_streams(self, obj):
        from apps.music.models import StreamEvent

        return StreamEvent.objects.filter(track__album__artist_profile=obj).count()

    def get_total_listeners(self, obj):
        from apps.music.models import StreamEvent

        return StreamEvent.objects.filter(track__album__artist_profile=obj).values("user").distinct().count()


class ForgotPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ForgotPasswordConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class ChangePasswordSerializer(serializers.Serializer):
    """Authenticated in-settings password change — distinct from the forgot/reset
    token flow above, which is for a logged-out user who can't prove current_password.
    """

    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
