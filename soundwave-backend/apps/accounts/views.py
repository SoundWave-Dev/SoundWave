from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.models import User
from apps.accounts.serializers import (
    ArtistRegisterSerializer,
    ForgotPasswordConfirmSerializer,
    ForgotPasswordRequestSerializer,
    ListenerRegisterSerializer,
    UserSerializer,
)

# TODO(Foad): swap in a serializer that embeds `role` into the JWT claims so the
# frontend can redirect listener/artist -> /home vs support/admin -> /support
# without an extra request (see TASKS_FOAD.md login redirect requirement).
LoginView = TokenObtainPairView
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
        # TODO(Foad): send reset email
        return Response(status=status.HTTP_200_OK)


class ForgotPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO(Foad): validate token, set new password
        return Response(status=status.HTTP_200_OK)
