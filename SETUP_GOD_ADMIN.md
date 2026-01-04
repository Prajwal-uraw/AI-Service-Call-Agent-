# God Admin Setup Instructions

## Issue: God Mode Features Not Showing

The God Mode panel requires the user to be authenticated and have the god admin role in the database.

## Steps to Fix:

### 1. Run the God Admin Migration in Supabase

Go to your Supabase SQL Editor and run the migration file:

```sql
-- File: database/migrations/024_god_admin_user.sql
-- This creates the admin_users table and sets up your god admin user

-- Run this in Supabase SQL Editor
```

**Or manually run these commands:**

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '["*"]',
    is_god_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your god admin user
INSERT INTO admin_users (
    user_id,
    email,
    role,
    permissions,
    is_god_admin,
    is_active
) VALUES (
    'ebd0b097-4a66-4597-804f-ff3a5bbdadd6',
    'Suvodkc@gmail.com',
    'god_admin',
    '["*", "admin:*", "tenant:*", "user:*", "billing:*", "system:*", "api:*", "database:*"]',
    TRUE,
    TRUE
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'god_admin',
    permissions = '["*", "admin:*", "tenant:*", "user:*", "billing:*", "system:*", "api:*", "database:*"]',
    is_god_admin = TRUE,
    is_active = TRUE,
    updated_at = NOW();

-- Verify it worked
SELECT user_id, email, role, is_god_admin 
FROM admin_users 
WHERE email = 'Suvodkc@gmail.com';
```

### 2. Verify Your User ID

Make sure you're logged in with the correct email: `Suvodkc@gmail.com`

The dashboard checks for:
- Email: `Suvodkc@gmail.com`
- User ID: `ebd0b097-4a66-4597-804f-ff3a5bbdadd6`

### 3. Check Authentication

1. Log out and log back in to refresh your session
2. Check browser console for any errors
3. The dashboard should now show the God Mode panel

## Troubleshooting

If God Mode still doesn't show:

1. **Check if you're logged in:**
   - Open browser console
   - Look for "Error checking admin status" messages

2. **Verify the table exists:**
   ```sql
   SELECT * FROM admin_users LIMIT 1;
   ```

3. **Check your user ID:**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'Suvodkc@gmail.com';
   ```

4. **Update the user_id in the code if different:**
   - File: `frontend/app/dashboard/page.tsx`
   - Line 69: Update `godAdminId` with your actual user ID

## Expected Result

After setup, you should see:
- ⚡ GOD MODE ACTIVATED ⚡ banner at the top
- 15+ admin tool cards with hover effects
- Real-time lead counts
- Access to all admin features
