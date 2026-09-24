# Payments setup — Stripe Dashboard & Vercel

## One-time sale vs monthly subscription (code differences)

| Concern | One-time (`kind: "one_time"`) | Subscription (`kind: "subscription"`) |
| --- | --- | --- |
| Catalog | `lib/catalog/products.ts` → `kind: "one_time"` | same file → `kind: "subscription"` + `interval: "month"` |
| Checkout Session | `mode: "payment"` | `mode: "subscription"` |
| Price payload | `price_data` without `recurring` | `price_data.recurring.interval` |
| Session extras | `payment_intent_data.metadata` | `subscription_data.metadata` |
| Buy label | `checkout.buy` | `checkout.subscribe` |
| Webhook (now) | `checkout.session.completed` | same event for first invoice |
| Webhook (later) | optional `payment_intent.*` | also `invoice.paid`, `customer.subscription.*` |
| Adaptive Pricing | Broad local methods when eligible | Cross-border renewals: card / Link / Apple Pay / Google Pay mainly |

Do not assume the whole shop is only one model — each catalog row chooses its kind.

---

## Adaptive Pricing

- Source prices stay **CAD** on the server.
- Set `STRIPE_ADAPTIVE_PRICING=true` only after enabling Adaptive Pricing in Stripe Dashboard → Settings → Adaptive Pricing.
- Checkout Session then sends `adaptive_pricing: { enabled: true }`.
- Success page shows **integration amount (CAD)** and, when present, **presentment amount/currency**.
- Site currency selector does **not** invent FX; Stripe presentment is authoritative at payment time.

---

## Order storage (no fake permanent DB)

Implemented now:

- `OrderRecord` + `OrderStore` interfaces (`lib/orders/types.ts`)
- Ephemeral **in-memory** store for local/preview testing only (`lib/orders/store.ts`)
- Webhook upserts order status + customer email/name; duplicate `event.id` is ignored
- Success page re-fetches the Checkout Session from Stripe and separately checks whether the webhook already wrote a record

**Not** claimed as production persistence. Pick one before going live:

1. **Neon / Vercel Postgres** — relational orders, webhook idempotency table (`stripe_event_id` unique)
2. **Supabase Postgres** — same idea + optional auth later
3. **PlanetScale / other MySQL** — fine if you prefer MySQL

Minimum tables: `orders`, `stripe_webhook_events` (unique event id).

---

## Stripe Dashboard (test mode first)

1. Create / open Stripe account; stay in **Test mode**.
2. Developers → API keys → copy **Secret** (`sk_test_…`) and **Publishable** (`pk_test_…`).
3. Settings → Adaptive Pricing → enable for Checkout (when ready), then set `STRIPE_ADAPTIVE_PRICING=true`.
4. Settings → Payment methods → enable cards (and any local methods you want for one-time).
5. Developers → Webhooks → Add endpoint:
   - Local: use Stripe CLI  
     `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Deployed Preview/Production: `https://YOUR_DOMAIN/api/webhooks/stripe`
6. Subscribe at least to `checkout.session.completed`.
7. Copy signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.
8. Confirm settlement currency can be **CAD**.

### Local end-to-end test

1. Copy `.env.example` → `.env.local` (gitignored) and fill test keys.
2. `npm run dev`
3. In another terminal: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Open shop → Buy / Subscribe → pay with test card `4242 4242 4242 4242`.
5. Land on success page; confirm webhook logged / order record appears in memory store.

---

## Vercel environment variables

Project → Settings → Environment Variables. Suggested mapping:

| Variable | Preview | Production | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Preview URL or custom | Production URL | Used for success/cancel URLs |
| `STRIPE_SECRET_KEY` | `sk_test_…` | keep test until go-live; then `sk_live_…` | Server only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | matching mode | Public |
| `STRIPE_WEBHOOK_SECRET` | Preview endpoint secret | Production endpoint secret | Separate endpoints recommended |
| `STRIPE_ADAPTIVE_PRICING` | `true` / `false` | same when ready | Opt-in |
| `PAYMENTS_LIVE_ENABLED` | `false` | `false` until intentional go-live | Live buttons require this **and** `sk_live_` |

### Go-live gate

Checkout buttons activate only when:

- `STRIPE_SECRET_KEY` starts with `sk_test_` → **test** mode (buttons on), or
- `STRIPE_SECRET_KEY` starts with `sk_live_` **and** `PAYMENTS_LIVE_ENABLED=true` → **live**

A live key without `PAYMENTS_LIVE_ENABLED=true` keeps buttons **off**.

---

## Security reminders

- Never send amounts from the browser for pricing — catalog CAD cents on the server only.
- Never store card numbers; Stripe Checkout hosts payment UI.
- Never commit `.env.local`.
- Do not treat the success redirect alone as fulfillment — webhook + idempotent event ids.
