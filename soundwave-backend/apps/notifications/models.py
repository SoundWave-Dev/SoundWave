from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Backs the frontend's `mockGetNotifications()` (spec §2.6). Notifications are
    role-specific in content (listener: subscription/new-release; artist: verification
    result/payout; support/admin: new tickets/verification requests) but share one model.
    """

    class Kind(models.TextChoices):
        SUBSCRIPTION_EXPIRING = "subscription_expiring", "Subscription expiring"
        NEW_RELEASE = "new_release", "New release from followed artist"
        ARTIST_VERIFICATION_RESULT = "artist_verification_result", "Artist verification result"
        PAYOUT_SETTLED = "payout_settled", "Payout settled"
        NEW_TICKET = "new_ticket", "New support ticket"
        NEW_ARTIST_REQUEST = "new_artist_request", "New artist verification request"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    kind = models.CharField(max_length=32, choices=Kind.choices)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    action_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
