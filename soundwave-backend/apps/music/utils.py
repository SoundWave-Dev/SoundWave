from apps.billing.models import Subscription


def get_active_plan(user):
    """The user's current SubscriptionPlan, or None if they have no active subscription
    (treated the same as "unlimited" by callers, matching apps.playlists' convention).
    """
    subscription = (
        Subscription.objects.filter(user=user, status=Subscription.Status.ACTIVE)
        .select_related("plan")
        .first()
    )
    return subscription.plan if subscription else None
