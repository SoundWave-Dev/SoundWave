# TODO(Foad): minimum tests for this app:
# - admin can update Silver/Gold price via /plans/price/, non-admin gets 403
# - subscribing creates a PaymentTransaction(status=pending)
# - a successful payment callback activates the Subscription
# - a listener cannot see other artists' payout rows
