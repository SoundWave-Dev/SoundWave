from rest_framework import serializers

from apps.billing.models import Payout, PaymentTransaction, Subscription, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"
        read_only_fields = ["tier"]  # tiers are fixed (free/silver/gold); only price/limits are editable


class SubscriptionPlanPriceUpdateSerializer(serializers.Serializer):
    """Admin-only price panel (spec §2.11.3): two number inputs, silver + gold."""

    silver_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    gold_price = serializers.DecimalField(max_digits=10, decimal_places=2)


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ["id", "plan", "duration_months", "status", "started_at", "expires_at", "auto_renew"]
        read_only_fields = ["status", "started_at", "expires_at"]


class SubscribeRequestSerializer(serializers.Serializer):
    plan_tier = serializers.ChoiceField(choices=SubscriptionPlan.Tier.choices)
    duration_months = serializers.ChoiceField(choices=Subscription.Duration.choices)
    # TODO(Foad): view creates a pending PaymentTransaction + Subscription(status=pending
    # equivalent, or defer Subscription creation until payment succeeds) then returns
    # the gateway redirect URL from apps.billing.gateways.get_gateway().request_payment()


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = ["id", "gateway", "amount", "status", "gateway_ref_id", "created_at"]
        read_only_fields = fields


class PayoutSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source="artist_profile.stage_name", read_only=True)

    class Meta:
        model = Payout
        fields = [
            "id", "artist_profile", "artist_name", "period_month",
            "unique_listeners", "total_streams", "amount", "status", "settled_at",
        ]
        read_only_fields = [f for f in fields if f != "status"]
