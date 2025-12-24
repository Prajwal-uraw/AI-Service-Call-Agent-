# Supabase Auth Setup Guide

## 🔐 Quick Setup Instructions

### Step 1: Enable Email Auth (Already Done)
Your Supabase project already has email authentication enabled.

### Step 2: Configure Site URL
1. Go to: https://soudakcdmpcfavticrxd.supabase.co/project/_/auth/url-configuration
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - `https://your-production-domain.com/auth/callback` (when deployed)

### Step 3: Enable OAuth Providers (Optional)

#### Google OAuth
1. Go to: https://soudakcdmpcfavticrxd.supabase.co/project/_/auth/providers
2. Click "Google"
3. Enable "Google enabled"
4. Add your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
5. Authorized redirect URI: `https://soudakcdmpcfavticrxd.supabase.co/auth/v1/callback`

#### GitHub OAuth
1. Click "GitHub" in providers
2. Enable "GitHub enabled"
3. Add GitHub OAuth App credentials
4. Callback URL: `https://soudakcdmpcfavticrxd.supabase.co/auth/v1/callback`

### Step 4: Email Templates (Optional)
Customize email templates at:
https://soudakcdmpcfavticrxd.supabase.co/project/_/auth/templates

---

## 🎯 What's Already Configured

✅ Supabase URL: `https://soudakcdmpcfavticrxd.supabase.co`
✅ Anon Key: Already in `.env.local`
✅ Service Key: Already in `.env.local`
✅ Email Auth: Enabled by default

---

## 🚀 Test Login Flow

After setup, test at: http://localhost:3000/login

**Demo Auth** (fallback):
- Email: `demo@kestrel.com`
- Password: `demo123`

**Real Auth** (Supabase):
- Sign up with any email
- Check email for verification link
- Login after verification

---

## 📝 Notes

- Demo auth will remain available as fallback
- Real users will be stored in Supabase `auth.users` table
- OAuth providers are optional - email auth works out of the box
