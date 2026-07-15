from django.conf import settings
from django.db import models


class SubscriptionPlan(models.Model):
    """Admin-editable tier config (spec §2.4 table + §3.2 — price/limit changes must
    NEVER require a code deploy, so these live in the DB and are exposed via the
    admin's pricing panel, not as Django settings constants).
    """

    class Tier(models.TextChoices):
        FREE = "free", "Free"
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"

    tier = models.CharField(max_length=16, choices=Tier.choices, unique=True)
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    daily_stream_limit = models.PositiveIntegerField(null=True, blank=True)  # null = unlimited
    playlist_limit = models.PositiveIntegerField(null=True, blank=True)  # null = unlimited
    can_upload_profile_photo = models.BooleanField(default=False)
    can_download_tracks = models.BooleanField(default=False)
    early_access_to_releases = models.BooleanField(default=False)
    can_view_artist_stats = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.get_tier_display()


class Subscription(models.Model):
    """A user's current/past subscription period. Renewal windows are 1/3/6/12
    months per spec §3.2 — `expires_at` drives access-level checks in
    apps.accounts.permissions and apps.music/apps.playlists limit checks.
    """

    class Duration(models.IntegerChoices):
        ONE_MONTH = 1
        THREE_MONTHS = 3
        SIX_MONTHS = 6
        TWELVE_MONTHS = 12

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="subscriptions")
    duration_months = models.PositiveSmallIntegerField(choices=Duration.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    started_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    auto_renew = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user_id} · {self.plan.tier} · {self.status}"


class PaymentTransaction(models.Model):
    """One row per payment-gateway attempt (spec §3.6 — track success/failed/pending)."""

    class Gateway(models.TextChoices):
        ZARINPAL = "zarinpal", "ZarinPal"
        AQAYEPARDAKHT = "aqayepardakht", "AqayePardakht"
        PAYPING = "payping", "PayPing"
        SIZPAY = "sizpay", "SizPay"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    subscription = models.ForeignKey(
        Subscription, null=True, blank=True, on_delete=models.SET_NULL, related_name="payments"
    )
    gateway = models.CharField(max_length=16, choices=Gateway.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    gateway_ref_id = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.gateway}:{self.gateway_ref_id or self.pk} · {self.status}"


class Payout(models.Model):
    """Monthly artist settlement row for the admin accounting tab (spec §2.11.2)."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending settlement"
        PAID = "paid", "Paid"

    artist_profile = models.ForeignKey(
        "accounts.ArtistProfile", on_delete=models.CASCADE, related_name="payouts"
    )
    period_month = models.DateField(help_text="First day of the settlement month")
    unique_listeners = models.PositiveIntegerField(default=0)
    total_streams = models.PositiveIntegerField(default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    settled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="settled_payouts"
    )
    settled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["artist_profile", "period_month"]
        ordering = ["-period_month"]

    # TODO(Foad): the payout formula (unique_listeners/total_streams -> amount) is
    # intentionally left to Phase 2 design per spec §1 — implement in a management
    # command / Celery task that runs monthly, not on-request.
