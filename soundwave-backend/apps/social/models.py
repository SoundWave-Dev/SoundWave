from django.conf import settings
from django.db import models


class Follow(models.Model):
    """A user follows another user (who may be a listener or an artist) — spec §2.3/§2.4
    "Follow/Unfollow" appears on both the user profile and artist profile pages, so one
    model covers both rather than a separate ArtistFollow table.
    """

    follower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="following")
    followee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="followers")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["follower", "followee"]
        constraints = [
            models.CheckConstraint(check=~models.Q(follower=models.F("followee")), name="cannot_follow_self")
        ]
