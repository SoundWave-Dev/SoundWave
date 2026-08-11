import secrets

from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.models import PasswordResetToken, User
from apps.accounts.serializers import (
    ArtistRegisterSerializer,
    ForgotPasswordConfirmSerializer,
    ForgotPasswordRequestSerializer,
    ListenerRegisterSerializer,
    UserSerializer,
)


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Embeds `role` into the JWT claims so the frontend can redirect listener/artist
    -> /home vs support/admin -> /support without an extra request.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token


class LoginView(TokenObtainPairView):
    serializer_class = RoleTokenObtainPairSerializer


RefreshTokenView = TokenRefreshView


class RegisterListenerView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ListenerRegisterSerializer


class RegisterArtistView(generics.CreateAPIView):
    """Creates User(role=artist) + ArtistProfile(status=pending) — spec §2.1."""

    permission_classes = [permissions.AllowAny]
    serializer_class = ArtistRegisterSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH the logged-in user's own profile (spec §2.3)."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ForgotPasswordRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user is not None:
            reset = PasswordResetToken.objects.create(user=user, token=secrets.token_urlsafe(32))
            send_mail(
                subject="Reset your SoundWave password",
                message=f"Use this code to reset your password: {reset.token}\nIt expires in 1 hour.",
                from_email=None,
                recipient_list=[user.email],
                fail_silently=True,
            )

        # Always 200 regardless of whether the email exists — don't leak account existence.
        return Response(status=status.HTTP_200_OK)


class ForgotPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reset = PasswordResetToken.objects.filter(token=serializer.validated_data["token"]).first()
        if reset is None or not reset.is_valid:
            return Response({"token": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user = reset.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        reset.used_at = timezone.now()
        reset.save(update_fields=["used_at"])

        return Response(status=status.HTTP_200_OK)
