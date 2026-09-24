# Accounts, orders & owner panel

## Stack choice

- **Postgres (Neon / Vercel Postgres)** via Prisma — durable users, paid orders, webhook idempotency.
- **Auth.js (NextAuth v5) Credentials + JWT** — email/password with server-hashed passwords (`bcryptjs`), email verification, password reset. Role (`CUSTOMER` | `OWNER`) lives on the user row and is copied into the signed JWT; clients cannot elevate themselves.

## Customer auth flows

| Path | Purpose |
| --- | --- |
| `/{locale}/sign-up` | Always creates `CUSTOMER` only |
| `/{locale}/verify-email?token=` | Marks email verified |
| `/{locale}/sign-in` | Requires verified email |
| `/{locale}/forgot-password` / `reset-password` | Tokenized reset |
| `/{locale}/account` | Profile + **own** paid orders (`where: { userId }`) |

## Checkout → paid order

1. Cart → `POST /api/checkout` (Stripe Checkout Session; CAD amounts from server catalog).
2. Customer pays on Stripe.
3. `POST /api/webhooks/stripe` verifies signature, requires `payment_status === "paid"`, then `createPaidOrderFromCheckoutSession`.
4. Idempotency: unique `stripeCheckoutSessionId` + `ProcessedStripeEvent` ids — retries do not create a second order.

Without `DATABASE_URL`, checkout can still run in Stripe test mode, but **no order rows** are written and the owner panel stays empty (no fake sample orders).

## Owner bootstrap (first OWNER only)

1. Set `DATABASE_URL`, `AUTH_SECRET`, and a long random `OWNER_BOOTSTRAP_SECRET` in `.env.local` / Vercel Preview (never commit secrets).
2. Run migrations: `npx prisma migrate dev --name init` (or `prisma db push` for a throwaway DB).
3. Open **`/owner/bootstrap`** (Preview / unlocked local only while coming-soon gates Production).
4. Submit name, email, password (12+), and the bootstrap secret.
5. Sign in at `/en/sign-in`, then open `/owner`.
6. After one OWNER exists, bootstrap refuses further creates. Remove or rotate `OWNER_BOOTSTRAP_SECRET` afterward.

Customer signup **never** accepts a role field.

## Owner panel

- URL: `/owner` — separate dark operations chrome (not the customer site shell).
- Access: `requireOwner()` on the server (session role from JWT ↔ DB). Knowing the URL or editing browser storage does not grant access.
- Lists paid orders; search/filter by fulfillment status; update NEW → PREPARING → SHIPPED → COMPLETED / CANCELED.
- Payment status is **read-only** (webhook-owned).
- Soft auto-refresh (~20s) so newly paid webhook orders appear.
- `/owner/catalog` is a placeholder for future CAD product/price edits.

## Coming soon vs Preview

- **Production**: `COMING_SOON_ENABLED=true` + countdown — public sees coming soon; full shop/account/owner need `?preview=SECRET` unlock cookie (or wait until you turn the gate off).
- **Preview / local**: leave `COMING_SOON_ENABLED` unset/false so the full stack is testable.
- Stripe webhooks are always allowed through the gate (no preview cookie on Stripe’s requests).

## Email in test

Without `EMAIL_FROM` / provider SMTP vars, verification and reset links are **logged to the server console** (`lib/auth/email.ts`) so Preview/local can complete the flow.
