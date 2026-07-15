from django.contrib import admin

from apps.billing.models import Payout, PaymentTransaction, Subscription, SubscriptionPlan

admin.site.register(SubscriptionPlan)
admin.site.register(Subscription)
admin.site.register(PaymentTransaction)
admin.site.register(Payout)
