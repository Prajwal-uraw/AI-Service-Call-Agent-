# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

You need to add these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/dashboard
- Select your project: `AI-Service-Call-Agent-`
- Go to **Settings** → **Environment Variables**

### 2. Add the following variables:

#### Supabase Configuration (Required)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```
**Note:** Get these from your Supabase project dashboard → Settings → API

#### API Configuration (Required)
```
NEXT_PUBLIC_API_URL=your-modal-api-url
MODAL_BASE_URL=your-modal-api-url
```

#### Application Settings
```
NEXT_PUBLIC_APP_NAME=Kestrel AI
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
APP_NAME=HVAC Voice Agent
HVAC_COMPANY_NAME=Your Company Name
```

#### Twilio Configuration (Required for Voice)
```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```
**Note:** Get these from your Twilio console

#### OpenAI Configuration (Required)
```
OPENAI_API_KEY=your-openai-api-key
```
**Note:** Get this from your OpenAI dashboard

#### Stripe Configuration
```
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```
**Note:** Get these from your `.env.local` file or Stripe dashboard

#### Feature Flags
```
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
```

#### Daily.co (Optional)
```
DAILY_API_KEY=your-daily-api-key
```
**Note:** Get this from your Daily.co dashboard

### 3. Environment Selection
For each variable, select which environments it should be available in:
- ✅ **Production** (always)
- ✅ **Preview** (recommended)
- ✅ **Development** (optional, uses .env.local)

### 4. After Adding Variables
1. Click **Save** for each variable
2. Redeploy your application:
   - Go to **Deployments** tab
   - Click the **...** menu on the latest deployment
   - Select **Redeploy**

## Troubleshooting

### If you still see the Supabase error:
1. Verify variables are saved in Vercel dashboard
2. Check that variable names match exactly (case-sensitive)
3. Ensure you've redeployed after adding variables
4. Check browser console for the exact error message

### To verify variables are loaded:
Add this to any page temporarily:
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

## Important Notes
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Other variables are only available server-side
- Changes to environment variables require a redeploy
- Never commit `.env.local` to git (it's in .gitignore)
