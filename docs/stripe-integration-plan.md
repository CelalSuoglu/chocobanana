# Stripe Checkout & Adaptive Pricing — Integration Plan

See the living setup guide: [payments-setup.md](./payments-setup.md).

## Summary

- Admin catalog language: English (`nameEn` / `descriptionEn` in `lib/catalog/products.ts`).
- Source currency: **CAD** cents on the server.
- Checkout: Stripe-hosted Checkout Sessions via `POST /api/checkout`.
- Verification: `POST /api/webhooks/stripe` with signature check + event idempotency.
- Adaptive Pricing: optional via `STRIPE_ADAPTIVE_PRICING=true` after Dashboard enablement.
- Live buttons gated by `PAYMENTS_LIVE_ENABLED` + live secret key.
