from django.conf import settings
from django.db import models

# Note: play history itself is NOT duplicated here — apps.music.StreamEvent is already
# the source of truth for "what did this user play and when" (spec §3.1: don't create
# more models than you need). This app only adds what StreamEvent can't represent:
# device-synced user settings.


class UserPreference(models.Model):
    """Cross-device settings sync (spec §3.5) — the frontend currently keeps these in
    Local Storage per spec §1.13, which doesn't follow the user across devices.
    """

    class Language(models.TextChoices):
        FA = "fa", "Persian"
        EN = "en", "English"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preferences")
    language = models.CharField(max_length=8, choices=Language.choices, default=Language.EN)
    system_volume = models.PositiveSmallIntegerField(default=80)  # 0-100, spec §2.5
    notify_new_releases = models.BooleanField(default=True)
    notify_subscription = models.BooleanField(default=True)
    notify_artist_verification = models.BooleanField(default=True)
    notify_tickets = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
