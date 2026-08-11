from datetime import timedelta

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Users log in with email; `username` is system-assigned, not chosen at signup."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user shared by all four roles from the spec (listener/artist/support/admin).

    `username` keeps AbstractUser's field but is system-generated (e.g. from email)
    rather than user-chosen — the spec calls this "the system-assigned username"
    shown on the profile page, distinct from `display_name`.
    """

    class Role(models.TextChoices):
        LISTENER = "listener", "Listener"
        ARTIST = "artist", "Artist"
        SUPPORT = "support", "Support"
        ADMIN = "admin", "Admin"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"
        # Value matches the frontend's gender union (types/index.ts) exactly —
        # registration/profile forms send this literal string.
        PREFER_NOT_TO_SAY = "prefer_not_to_say", "Prefer not to say"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.LISTENER)
    display_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, default=Gender.PREFER_NOT_TO_SAY)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    accepted_privacy_policy_at = models.DateTimeField(null=True, blank=True)

    # TODO(Foad): daily stream usage is subscription-tier-limited (spec §2.4 table) —
    # decide whether this is a rolling counter on User or derived from apps.music.StreamEvent.

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class ArtistProfile(models.Model):
    """One-to-one extension of User for role=artist, holding verification state.

    Approval/rejection is performed by support or admin — see apps.support for the
    review endpoints/dashboard (spec §2.11.1 "Tickets and identity verification").
    """

    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Pending review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="artist_profile")
    stage_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    portfolio_url = models.URLField(blank=True)  # TODO(Foad): Phase 1 was UI-only; wire real upload/storage here
    verification_status = models.CharField(
        max_length=16, choices=VerificationStatus.choices, default=VerificationStatus.PENDING
    )
    rejection_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_artist_profiles"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_verified(self):
        return self.verification_status == self.VerificationStatus.APPROVED

    def __str__(self):
        return self.stage_name


class PasswordResetToken(models.Model):
    """Backs forgot/reset password (spec §2.1). Keeping the token itself (rather than
    Django's uid+PasswordResetTokenGenerator pair) as the sole lookup key matches the
    frontend contract: ForgotPasswordConfirmSerializer only carries `token`, not a uid.
    """

    TOKEN_LIFETIME = timedelta(hours=1)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_reset_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_valid(self):
        return self.used_at is None and self.created_at >= timezone.now() - self.TOKEN_LIFETIME
