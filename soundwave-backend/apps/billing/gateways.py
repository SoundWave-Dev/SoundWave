"""Thin abstraction over the payment gateway so apps/billing/views.py doesn't hard-code
one provider. Pick ONE of the sandboxes documented in the spec §3.6:
  - ZarinPal:        https://www.zarinpal.com/docs/paymentGateway/sandBox.html
  - AqayePardakht:   https://aqayepardakht.ir/api/
  - PayPing:         https://docs.payping.ir/
  - SizPay:          https://doc.sizpay.ir/

TODO(Foad): implement request_payment() (returns a redirect URL) and verify_payment()
(callback handler that flips PaymentTransaction.status) for settings.PAYMENT_GATEWAY.
"""

from django.conf import settings


class PaymentGateway:
    def request_payment(self, *, amount, description, callback_url) -> str:
        """Returns the URL to redirect the user to for payment."""
        raise NotImplementedError

    def verify_payment(self, *, authority, amount) -> bool:
        """Called from the gateway's callback endpoint; returns whether payment succeeded."""
        raise NotImplementedError


def get_gateway() -> PaymentGateway:
    # TODO(Foad): return a concrete implementation keyed on settings.PAYMENT_GATEWAY
    raise NotImplementedError(f"No gateway implemented for {settings.PAYMENT_GATEWAY}")
