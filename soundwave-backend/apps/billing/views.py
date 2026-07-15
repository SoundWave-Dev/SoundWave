from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin, IsSupportOrAdmin
from apps.billing.models import Payout, PaymentTransaction, Subscription, SubscriptionPlan
from apps.billing.serializers import (
    PaymentTransactionSerializer,
    PayoutSerializer,
    SubscribeRequestSerializer,
    SubscriptionPlanPriceUpdateSerializer,
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
)


class SubscriptionPlanListView(generics.ListAPIView):
    """Public: powers the pricing table on /settings and /login (spec §2.4)."""

    permission_classes = [permissions.AllowAny]
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer


class SubscriptionPlanPriceUpdateView(APIView):
    """Admin-only pricing panel (spec §2.11.3) — updates Silver/Gold prices with
    no code change required.
    """

    permission_classes = [IsAdmin]

    def patch(self, request):
        serializer = SubscriptionPlanPriceUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO(Foad): SubscriptionPlan.objects.filter(tier=SILVER).update(monthly_price=...), same for GOLD
        return Response(status=status.HTTP_200_OK)


class MySubscriptionView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubscriptionSerializer

    def get_object(self):
        # TODO(Foad): return request.user's active subscription, or a virtual "free" one
        raise NotImplementedError


class SubscribeView(APIView):
    """Kicks off a subscription purchase/renewal + payment (spec §3.2, §3.6)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubscribeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO(Foad): create PaymentTransaction(status=pending), call gateways.get_gateway()
        # .request_payment(), return {"redirect_url": ...}
        raise NotImplementedError


class PaymentCallbackView(APIView):
    """Gateway redirects/webhooks the user here after payment (spec §3.6)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # TODO(Foad): verify_payment(), flip PaymentTransaction.status, activate Subscription
        raise NotImplementedError


class PayoutViewSet(viewsets.ReadOnlyModelViewSet):
    """Artists see their own rows; support/admin see all (spec §2.11.2 accounting tab)."""

    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("support", "admin"):
            return Payout.objects.all()
        return Payout.objects.filter(artist_profile__user=user)


class ConfirmSettlementView(APIView):
    """Admin-only 'Confirm settlement' button — toggles a payout to Paid (spec §2.11.2)."""

    permission_classes = [IsAdmin]

    def post(self, request, payout_id):
        # TODO(Foad): Payout.objects.filter(pk=payout_id).update(status=PAID, settled_by=request.user, settled_at=now())
        raise NotImplementedError


class RevenueSummaryView(APIView):
    """Aggregated-only report for the admin dashboard (spec §3.7 — never dump raw rows)."""

    permission_classes = [IsSupportOrAdmin]

    def get(self, request):
        # TODO(Foad): return {"current_month_revenue": ..., "by_tier": {...}} computed
        # server-side via aggregate queries, not by shipping all PaymentTransactions.
        raise NotImplementedError


class SubscriptionDistributionView(APIView):
    """Pie-chart data: user counts per tier (spec §2.11.3)."""

    permission_classes = [IsAdmin]

    def get(self, request):
        # TODO(Foad): User.objects.values("subscriptions__plan__tier").annotate(count=Count("id"))
        raise NotImplementedError
