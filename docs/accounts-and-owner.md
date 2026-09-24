# Accounts, orders & owner panel

## Stack choice

- **Postgres (Neon / Vercel Postgres)** via Prisma — durable users, paid orders, webhook idempotency.
- **Auth.js (NextAuth v5) Credentials + JWT** — email/password with server-hashed passwords (`bcryptjs`), email verification, password reset. Role (`CUSTOMER` | `OWNER`) lives on the user row; sensitive owner routes re-check the live DB role (JWT alone is not enough).
- Passwords are stored only as `passwordHash` (bcrypt) — never plaintext.

## Customer auth flows

| Path | Purpose |
| --- | --- |
| `/{locale}/register` (alias: `/sign-up`) | Full signup. Always `CUSTOMER` only. Requires `RESEND_API_KEY`. |
| `/{locale}/verify-email?token=` | Marks email verified |
| `/{locale}/login` (alias: `/sign-in`) | Requires verified email |
| `/{locale}/forgot-password` / `reset-password` | Tokenized reset (requires email service) |
| `/{locale}/account` | Edit own profile/address + **own** paid orders (`where: { userId }`) |

Country is stored as ISO-3166 alpha-2. Phone is normalized toward E.164 (`+` + digits). Address line 2 is optional; province/state is required.

## Checkout → paid order

1. Cart → `POST /api/checkout` — **refuses** if `DATABASE_URL` is missing (no Stripe session, no charge).
2. Customer pays on Stripe.
3. `POST /api/webhooks/stripe` verifies signature, requires `payment_status === "paid"`, then `createPaidOrderFromCheckoutSession`.
4. Shipping on the order is a **snapshot** at purchase time.
5. Idempotency: unique `stripeCheckoutSessionId` + `ProcessedStripeEvent` ids.

## Owner panel (form unlock + role-gated)

1. Preview env: `DATABASE_URL`, `AUTH_SECRET`, `OWNER_BOOTSTRAP_SECRET`, `OWNER_PANEL_SECRET`.
2. `npx prisma migrate deploy`
3. `/owner/gate` → enter panel password (form POST → httpOnly derived cookie) → `/owner/bootstrap` (first owner only) → `/owner/login`
4. **Never** put secrets in the URL (`?owner=` / `?preview=` are stripped and ignored).
5. Dashboard / Members / Orders — fulfillment updates only; payment status is webhook-owned.

## Coming soon vs Preview

- **Production**: `COMING_SOON_ENABLED=true` + countdown.
- Unlock full site while gated: open **`/site-unlock`**, enter `COMING_SOON_PREVIEW_SECRET` in the form.
- Unlock owner-only: **`/owner/gate`** with `OWNER_PANEL_SECRET`.
- Stripe webhooks always bypass the public gate.

## Email

- Requires `RESEND_API_KEY` **and** `EMAIL_FROM` on a Resend-verified domain.
- Without both, register / forgot-password show **setup required**. Links are never logged.
- Failed sends roll back the account and show codes like `EMAIL_DOMAIN_UNVERIFIED` (no secret values in UI).

## Manual checklist

1. Preview env: `DATABASE_URL`, `AUTH_SECRET`, `OWNER_PANEL_SECRET`, `OWNER_BOOTSTRAP_SECRET`, `RESEND_API_KEY`.
2. `npx prisma migrate deploy`
3. `/en/register` → verify email → `/en/login` → `/en/account`
4. Bootstrap first owner once → `/owner`
5. Never commit `.env.local`
