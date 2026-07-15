from rest_framework.permissions import BasePermission

from apps.accounts.models import User


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsSupportOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.SUPPORT, User.Role.ADMIN)
        )


class IsApprovedArtist(BasePermission):
    """Gate for apps.music write endpoints — spec §2.10: only role=artist AND status=approved."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and user.role == User.Role.ARTIST):
            return False
        return getattr(user, "artist_profile", None) is not None and user.artist_profile.is_verified


class IsOwner(BasePermission):
    """Generic object-level check — object must expose a `user` (or `owner`) attribute."""

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        return owner == request.user
