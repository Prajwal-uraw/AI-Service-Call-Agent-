# 🚀 Vercel Build Checklist - Pre-Deployment Verification

Use this prompt before pushing to production to catch all potential build failures.

---

## 📋 Comprehensive Build Verification Prompt

```
Before I push this code to production, please perform a comprehensive Vercel build verification:

1. **TypeScript Errors:**
   - Scan ALL files in /frontend/app and /frontend/components for TypeScript errors
   - Check for missing type definitions, incorrect type assignments
   - Verify all imported types exist and are exported correctly
   - Check for Next.js 15 compatibility (params as Promise, etc.)

2. **API Routes Build-Time Issues:**
   - Check ALL /frontend/app/api routes for module-level initialization
   - Ensure NO Supabase/Stripe clients initialized at module level (use functions instead)
   - Verify all environment variables have fallbacks or runtime checks
   - Check for any database connections at build time

3. **Missing Dependencies:**
   - Verify all imports have corresponding packages in package.json
   - Check for missing UI components (shadcn/ui, Radix UI)
   - Verify all icon imports exist (lucide-react)
   - Check for any dynamic imports that might fail

4. **Environment Variables:**
   - List all required environment variables used in the code
   - Verify they're documented in .env.example
   - Check for any hardcoded secrets or API keys

5. **Import/Export Issues:**
   - Check for circular dependencies
   - Verify all exports match their imports
   - Check for missing default exports in page.tsx files
   - Verify component exports in index files

6. **Build Configuration:**
   - Check .vercelignore excludes problematic folders (Private/, etc.)
   - Verify next.config.js has correct settings
   - Check for any webpack/build configuration issues

7. **External Dependencies:**
   - Verify Stripe API version matches TypeScript definitions
   - Check Supabase client version compatibility
   - Verify all third-party API integrations are properly typed

8. **Common Next.js 15 Issues:**
   - Check for deprecated Next.js patterns
   - Verify all async components are properly handled
   - Check for server/client component boundaries
   - Verify metadata exports in layout files

Please provide:
- A list of ALL potential build failures you find
- Specific file paths and line numbers for each issue
- Recommended fixes for each problem
- Priority level (critical/high/medium/low) for each issue

After the scan, create a single commit that fixes ALL issues at once.
```

---

## 🔍 Specific Checks to Run

### **1. Module-Level Initialization Check**
```bash
# Search for problematic patterns
grep -r "const supabase = createClient" frontend/app/api/
grep -r "const stripe = new Stripe" frontend/app/api/
grep -r "const prisma = new PrismaClient" frontend/app/api/
```

**Fix:** Move all client initialization into functions called at runtime.

### **2. TypeScript Strict Mode Check**
```bash
# Run TypeScript compiler
cd frontend
npx tsc --noEmit
```

**Fix:** Address all type errors before pushing.

### **3. Missing Dependencies Check**
```bash
# Check for uninstalled imports
cd frontend
npm run build 2>&1 | grep "Cannot find module"
```

**Fix:** Install all missing packages.

### **4. Environment Variable Check**
```bash
# Find all env var usage
grep -r "process.env" frontend/app/api/ | grep -v "node_modules"
```

**Fix:** Ensure all env vars have runtime checks.

---

## ⚠️ Common Vercel Build Failures

### **1. Supabase Client at Module Level**
❌ **Wrong:**
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

✅ **Correct:**
```typescript
function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase(); // Initialize at runtime
  // ... rest of handler
}
```

### **2. Stripe API Version Mismatch**
❌ **Wrong:**
```typescript
apiVersion: '2024-12-18.acacia' // Old version
```

✅ **Correct:**
```typescript
apiVersion: '2025-12-15.clover' // Latest version matching TypeScript types
```

### **3. Missing Component Exports**
❌ **Wrong:**
```typescript
// dialog.tsx
export const Dialog = DialogPrimitive.Root;
// Missing DialogTrigger export
```

✅ **Correct:**
```typescript
// dialog.tsx
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
```

### **4. Next.js 15 Params Handling**
❌ **Wrong:**
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id; // Error in Next.js 15
}
```

✅ **Correct:**
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Await params in Next.js 15
}
```

### **5. Private Folder in Build**
❌ **Wrong:**
```
# No .vercelignore
```

✅ **Correct:**
```
# .vercelignore
Private/
Private/**/*
*.py
```

---

## 🎯 Pre-Push Checklist

Before pushing to GitHub (which triggers Vercel):

- [ ] Run `npm run build` locally in /frontend
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Verify all API routes use runtime initialization
- [ ] Check .vercelignore excludes problematic files
- [ ] Verify all environment variables are documented
- [ ] Test all critical pages locally
- [ ] Check for missing dependencies
- [ ] Verify Stripe API version matches types
- [ ] Check for circular dependencies
- [ ] Review recent changes for build-time issues

---

## 🚨 Emergency Build Fix Process

If Vercel build fails:

1. **Read the error message carefully** - it tells you exactly what's wrong
2. **Identify the file and line number** from the stack trace
3. **Check the pattern** - is it env vars, types, or imports?
4. **Apply the fix** using the patterns above
5. **Test locally** with `npm run build`
6. **Push single commit** with all fixes

---

## 📝 Quick Reference: Common Fixes

| Error | Fix |
|-------|-----|
| `supabaseKey is required` | Move `createClient` to runtime function |
| `Cannot find module` | Install missing package or fix import path |
| `Type X is not assignable to type Y` | Update type definitions or API version |
| `Cannot find name 'X'` | Add missing function or import |
| `params.id` error | Await params in Next.js 15 |
| `pg module not found` | Add to .vercelignore |

---

## 🎓 Best Practices

1. **Never initialize clients at module level** in API routes
2. **Always use runtime checks** for environment variables
3. **Keep API versions in sync** with TypeScript definitions
4. **Test builds locally** before pushing
5. **Use .vercelignore** to exclude backend code
6. **Document all env vars** in .env.example
7. **Use functions for client initialization** (getSupabase, getStripe)
8. **Check TypeScript errors** before committing

---

## 💡 Pro Tips

- **Use the verification prompt** at the start of every session
- **Run local builds** frequently during development
- **Keep dependencies updated** to avoid version conflicts
- **Use TypeScript strict mode** to catch errors early
- **Monitor Vercel build logs** for warnings
- **Create helper functions** for common patterns (getSupabase, getStripe)
- **Document breaking changes** in commit messages

---

**Last Updated:** Jan 1, 2026
**Next.js Version:** 15.5.9
**Stripe API Version:** 2025-12-15.clover
