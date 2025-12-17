# QR Definitivo SaaS

Modern SaaS platform for generating permanent QR Codes with subscription handling.

## 🚀 Getting Started

### 1. Environment Setup
Rename `.env.example` to `.env` (or create it) with:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Get these from Stripe Dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
npx prisma migrate dev --name init
```

### 4. Run Development Server
```bash
npm run dev
```
Access at [http://localhost:3000](http://localhost:3000).

## 🛠 Features

- **Landing Page**: 3D Hero, Animations (GSAP).
- **Authentication**: Email/Password (NextAuth).
- **Dashboard**: Subscription-locked QR generation.
- **Redirect System**: `/q/[uuid]` handles permanent links.
- **Payments**: Stripe Webhook integration for syncing subscriptions.

## 💳 Stripe Integration

1. Create a Product/Price in Stripe.
2. Update `src/components/landing/Pricing.tsx` with your payment links.
3. Configure Webhook to point to `your-domain.com/api/webhooks/stripe` listening for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
