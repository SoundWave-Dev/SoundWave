"""Thin abstraction over the payment gateway so apps/billing/views.py doesn't hard-code
one provider. Pick ONE of the sandboxes documented in the spec §3.6:
  - ZarinPal:        https://www.zarinpal.com/docs/paymentGateway/sandBox.html
  - AqayePardakht:   https://aqayepardakht.ir/api/
  - PayPing:         https://docs.payping.ir/
  - SizPay:          https://doc.sizpay.ir/

Implemented: ZarinPal (REST v4 JSON API), selected via settings.PAYMENT_GATEWAY.
"""

import requests
from django.conf import settings


class PaymentGatewayError(Exception):
    """Raised when the gateway rejects a request/verification outright (bad merchant
    id, network failure, etc.) — distinct from a user simply cancelling payment.
    """


class PaymentGateway:
    def request_payment(self, *, amount, description, callback_url):
        """Kicks off a payment. Returns (redirect_url, reference_id) — reference_id is
        stored as PaymentTransaction.gateway_ref_id and passed back into verify_payment()
        from the callback endpoint.
        """
        raise NotImplementedError

    def verify_payment(self, *, reference_id, amount) -> bool:
        """Called from the gateway's callback endpoint; returns whether payment succeeded."""
        raise NotImplementedError


class ZarinPalGateway(PaymentGateway):
    """https://www.zarinpal.com/docs/paymentGateway/sandBox.html — REST v4 JSON API.
    Amounts are Toman, matching SubscriptionPlan.monthly_price.
    """

    def __init__(self):
        sandbox = settings.PAYMENT_GATEWAY_SANDBOX
        self.start_pay_base = "https://sandbox.zarinpal.com" if sandbox else "https://payment.zarinpal.com"
        self.api_base = "https://sandbox.zarinpal.com" if sandbox else "https://api.zarinpal.com"
        self.merchant_id = settings.PAYMENT_GATEWAY_MERCHANT_ID

    def request_payment(self, *, amount, description, callback_url):
        try:
            response = requests.post(
                f"{self.api_base}/pg/v4/payment/request.json",
                json={
                    "merchant_id": self.merchant_id,
                    "amount": int(amount),
                    "description": description,
                    "callback_url": callback_url,
                },
                timeout=10,
            )
            response.raise_for_status()
            payload = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise PaymentGatewayError(f"ZarinPal payment request failed: {exc}") from exc

        data = payload.get("data") or {}
        if data.get("code") != 100:
            raise PaymentGatewayError(f"ZarinPal payment request rejected: {payload}")

        authority = data["authority"]
        return f"{self.start_pay_base}/pg/StartPay/{authority}", authority

    def verify_payment(self, *, reference_id, amount) -> bool:
        try:
            response = requests.post(
                f"{self.api_base}/pg/v4/payment/verify.json",
                json={"merchant_id": self.merchant_id, "amount": int(amount), "authority": reference_id},
                timeout=10,
            )
            response.raise_for_status()
            payload = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise PaymentGatewayError(f"ZarinPal payment verification failed: {exc}") from exc

        data = payload.get("data") or {}
        # 100 = verified now, 101 = already verified (safe to treat as success, e.g. a
        # duplicate callback hit).
        return data.get("code") in (100, 101)


_GATEWAYS = {
    "zarinpal": ZarinPalGateway,
}


def get_gateway() -> PaymentGateway:
    gateway_cls = _GATEWAYS.get(settings.PAYMENT_GATEWAY)
    if gateway_cls is None:
        raise NotImplementedError(f"No gateway implemented for {settings.PAYMENT_GATEWAY}")
    return gateway_cls()
