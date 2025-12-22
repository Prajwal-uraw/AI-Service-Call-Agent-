# Troubleshooting Guide - Homepage & Login Issues

## 🚨 ISSUE: Still Seeing "Access Portal" Page Instead of Homepage

### **Problem**
User reports: "i still see the access portal page, i want homepage"

### **Root Cause**
Browser caching is likely showing the old version of the homepage. The code has been updated correctly, but the browser needs to be refreshed.

---

## ✅ SOLUTION: Clear Browser Cache & Hard Refresh

### **Step 1: Hard Refresh the Browser**

**Windows/Linux**:
- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac**:
- Press `Cmd + Shift + R`

**Alternative**:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

---

### **Step 2: Clear Browser Cache Completely**

**Chrome/Edge**:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**Firefox**:
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"

---

### **Step 3: Restart Development Server**

**Stop the server**:
- Press `Ctrl + C` in the terminal running the frontend

**Clear Next.js cache**:
```bash
cd frontend
rm -rf .next
npm run dev
```

**Or on Windows**:
```powershell
cd frontend
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 🔍 VERIFY THE HOMEPAGE IS CORRECT

The homepage file (`frontend/app/page.tsx`) should contain:

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Kestrel Voice Operations
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered voice operations and call management for modern businesses
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Access Portal <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calendar">
              <Button size="lg" variant="outline">
                Book a Demo
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {/* Feature cards */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Key Points**:
- ✅ NO `useEffect` with redirects
- ✅ NO authentication checks
- ✅ Shows welcome message and feature cards
- ✅ Has "Access Portal" button that links to `/login`

---

## 🚨 ISSUE: Can't Login

### **Problem**
User reports: "still cant login"

### **Possible Causes & Solutions**

#### **1. Login Button Not Working**

**Check**:
- Open browser DevTools (F12)
- Go to Console tab
- Try to login
- Look for any errors

**Solution**:
If you see errors about `setAuthToken`, verify the import:
```tsx
import { setAuthToken } from "@/lib/auth";
```

---

#### **2. Form Not Submitting**

**Check**:
- Make sure you're entering an email (any format works)
- Make sure you're entering a password (any text works)
- Both fields are required

**Solution**:
Try the "Quick Demo Access" button instead - it bypasses the form.

---

#### **3. Redirect Not Working**

**Check**:
After clicking login, watch the URL bar. It should change to `/admin/portal`.

**Solution**:
If it stays on `/login`, check browser console for errors.

---

#### **4. localStorage Not Working**

**Check**:
1. Open DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Look at Local Storage
4. After login, you should see:
   - `auth_token`
   - `user_email`
   - `user_role`

**Solution**:
If localStorage is blocked (private browsing), try regular browsing mode.

---

## 🧪 TESTING CHECKLIST

### **Homepage Test**:
1. ✅ Visit `http://localhost:3000`
2. ✅ Should see "Welcome to Kestrel Voice Operations"
3. ✅ Should see two buttons: "Access Portal" and "Book a Demo"
4. ✅ Should see 3 feature cards below
5. ✅ Should NOT auto-redirect

### **Login Test**:
1. ✅ Click "Access Portal" button
2. ✅ Should navigate to `/login`
3. ✅ Should see login form with email and password fields
4. ✅ Enter any email (e.g., `test@test.com`)
5. ✅ Enter any password (e.g., `password`)
6. ✅ Click "Sign In"
7. ✅ Should show loading spinner
8. ✅ Should redirect to `/admin/portal`

### **Quick Demo Test**:
1. ✅ Go to `/login`
2. ✅ Click "Quick Demo Access" button
3. ✅ Should redirect to `/admin/portal` immediately

---

## 🔧 MANUAL VERIFICATION

### **Check 1: Verify File Contents**

Open `frontend/app/page.tsx` and verify it matches the code above.

### **Check 2: Verify No Middleware Redirects**

Check if there's a `middleware.ts` file:
```bash
# In project root
ls middleware.ts
# or
ls frontend/middleware.ts
```

If it exists and has redirect logic, that could be interfering.

### **Check 3: Verify Layout Doesn't Redirect**

Open `frontend/app/layout.tsx` and make sure there's NO:
- `useEffect` with redirects
- `requireAuth()` calls
- Authentication checks

---

## 🚀 QUICK FIX COMMANDS

### **Full Reset**:
```bash
# Stop all servers
# Then:
cd frontend
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### **Clear Browser Everything**:
1. Close all browser tabs for `localhost:3000`
2. Clear cache (Ctrl+Shift+Delete)
3. Close browser completely
4. Reopen browser
5. Go to `http://localhost:3000`

---

## 📊 EXPECTED BEHAVIOR

### **Current Flow**:
```
1. Visit localhost:3000
   ↓
2. See landing page with "Welcome to Kestrel Voice Operations"
   ↓
3. Click "Access Portal"
   ↓
4. Navigate to /login
   ↓
5. Enter email/password OR click "Quick Demo Access"
   ↓
6. Authenticate (sets localStorage)
   ↓
7. Redirect to /admin/portal
   ↓
8. See admin dashboard
```

### **What You Should See**:

**At `localhost:3000`**:
- Large heading: "Welcome to Kestrel Voice Operations"
- Subtitle about AI-powered voice operations
- Blue "Access Portal" button
- White "Book a Demo" button
- 3 white cards with icons (Phone, Zap, Shield)

**At `localhost:3000/login`**:
- Kestrel logo at top
- "Sign in to your account" text
- Email input field
- Password input field
- Blue "Sign In" button
- "Quick Demo Access" button below

**At `localhost:3000/admin/portal`**:
- Navigation bar at top
- "Enterprise Admin Portal" heading
- Dashboard with stats and tabs

---

## ❌ WHAT YOU SHOULD NOT SEE

**At `localhost:3000`**:
- ❌ Immediate redirect to login
- ❌ Immediate redirect to admin portal
- ❌ Loading spinner
- ❌ "Redirecting..." message
- ❌ Blank page

**At `localhost:3000/login`**:
- ❌ Auto-login without clicking anything
- ❌ Immediate redirect
- ❌ Just a loading spinner

---

## 🆘 IF STILL NOT WORKING

### **Last Resort Steps**:

1. **Kill all Node processes**:
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

2. **Delete all cache**:
```bash
cd frontend
rm -rf .next
rm -rf node_modules/.cache
```

3. **Restart from scratch**:
```bash
npm run dev
```

4. **Use incognito/private browsing**:
- Open new incognito window
- Go to `http://localhost:3000`
- This ensures no cache

5. **Check different browser**:
- Try Chrome if using Firefox
- Try Firefox if using Chrome

---

## 📝 DEBUGGING CHECKLIST

If homepage still shows wrong content:

- [ ] Verified `frontend/app/page.tsx` has correct code
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Cleared browser cache completely
- [ ] Restarted Next.js dev server
- [ ] Deleted `.next` folder
- [ ] Tried incognito/private browsing
- [ ] Checked browser console for errors
- [ ] Verified no `middleware.ts` with redirects
- [ ] Verified `layout.tsx` has no auth checks

If login still doesn't work:

- [ ] Verified `frontend/app/login/page.tsx` has form
- [ ] Tried "Quick Demo Access" button
- [ ] Checked browser console for errors
- [ ] Verified localStorage is enabled
- [ ] Tried different email/password
- [ ] Checked Network tab for failed requests
- [ ] Verified `lib/auth.ts` exists and exports `setAuthToken`

---

**End of Troubleshooting Guide**
