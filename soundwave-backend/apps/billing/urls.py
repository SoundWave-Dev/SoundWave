from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.billing import views

router = DefaultRouter()
router.register("payouts", views.PayoutViewSet, basename="payout")

urlpatterns = [
    path("plans/", views.SubscriptionPlanListView.as_view(), name="plan-list"),
    path("plans/price/", views.SubscriptionPlanPriceUpdateView.as_view(), name="plan-price-update"),
    path("subscriptions/me/", views.MySubscriptionView.as_view(), name="subscription-me"),
    path("subscribe/", views.SubscribeView.as_view(), name="subscribe"),
    path("payment/callback/", views.PaymentCallbackView.as_view(), name="payment-callback"),
    path("payouts/<int:payout_id>/confirm-settlement/", views.ConfirmSettlementView.as_view(), name="payout-confirm"),
    path("reports/revenue-summary/", views.RevenueSummaryView.as_view(), name="revenue-summary"),
    path("reports/subscription-distribution/", views.SubscriptionDistributionView.as_view(), name="subscription-distribution"),
] + router.urls
