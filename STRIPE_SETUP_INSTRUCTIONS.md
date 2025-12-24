# Stripe Setup Instructions

## Environment Variables Added

The following Stripe keys have been added to `frontend/.env.local`:

```bash
STRIPE_SECRET_KEY=sk_live_[YOUR_STRIPE_SECRET_KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR_STRIPE_PUBLISHABLE_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

**Note:** Actual keys are stored in `.env.local` (not committed to git).

## Manual Setup Required

### 1. Vercel Environment Variables

Add these via Vercel Dashboard or CLI:

```bash
# Via Vercel Dashboard (https://vercel.com/dashboard)
1. Go to your project settings
2. Navigate to Environment Variables
3. Add each variable for Production, Preview, and Development

# Or via CLI (requires interactive input):
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
```

### 2. GitHub Secrets

Add via GitHub Repository Settings:

```bash
# Navigate to: Settings > Secrets and variables > Actions > New repository secret

1. STRIPE_SECRET_KEY
2. STRIPE_PUBLISHABLE_KEY  
3. STRIPE_WEBHOOK_SECRET
```

### 3. Modal Secrets (if using Modal)

```bash
# Via Modal CLI:
modal secret create stripe \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_PUBLISHABLE_KEY=pk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_...
```

## Webhook Configuration

Don't forget to configure your Stripe webhook endpoint:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for
4. Copy the webhook signing secret (already added above)

## Testing

Test your Stripe integration:

```bash
# Use Stripe test mode
npm run dev

# Test checkout flow at:
http://localhost:3000/billing
```

## Security Notes

- ✅ `.env.local` is in `.gitignore` (secrets won't be committed)
- ✅ Use `NEXT_PUBLIC_` prefix only for client-side keys
- ✅ Never commit actual keys to repository
- ⚠️ Remember to add these same keys to Vercel for production
