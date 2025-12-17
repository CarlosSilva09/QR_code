# QR Definitivo SaaS

Modern SaaS platform for generating permanent QR Codes with subscription handling.

## Getting Started

### 1. Environment Setup

Local development: copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."
```

Vercel/production: set the same variables in **Project Settings → Environment Variables**.

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup (Production)

```bash
npx prisma migrate deploy
```

### 4. Run Development Server

```bash
npm run dev
```

Access at `http://localhost:3000`.

## Features

- Landing page with animations
- Authentication (NextAuth credentials)
- Dashboard with subscription-locked QR generation
- Redirect system: `/q/[uuid]`
- Stripe checkout + webhooks for subscription sync

## Stripe Integration

1. Create Products/Prices in Stripe and set `STRIPE_PRICE_MONTHLY`/`STRIPE_PRICE_YEARLY`.
2. Configure the webhook endpoint: `/api/webhooks/stripe` listening for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

