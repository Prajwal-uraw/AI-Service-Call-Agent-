-- =====================================================
-- Migration 024: Create God Admin User
-- =====================================================
-- Run this in Supabase SQL Editor
-- User: Suvodkc@gmail.com (ebd0b097-4a66-4597-804f-ff3a5bbdadd6)
-- =====================================================

-- First, ensure we have a user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Create admin_users table for tracking admin access
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

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Insert the god admin user
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

-- Also add to user_roles table
INSERT INTO user_roles (
    user_id,
    role,
    permissions,
    is_active
) VALUES (
    'ebd0b097-4a66-4597-804f-ff3a5bbdadd6',
    'god_admin',
    '["*"]',
    TRUE
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'god_admin',
    permissions = '["*"]',
    is_active = TRUE,
    updated_at = NOW();

-- Create a function to check if user is god admin
CREATE OR REPLACE FUNCTION is_god_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = check_user_id 
        AND is_god_admin = TRUE 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check user permissions
CREATE OR REPLACE FUNCTION has_permission(check_user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    -- God admins have all permissions
    IF is_god_admin(check_user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Check specific permissions
    SELECT permissions INTO user_permissions
    FROM admin_users
    WHERE user_id = check_user_id AND is_active = TRUE;
    
    IF user_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check for wildcard or specific permission
    RETURN user_permissions ? '*' OR user_permissions ? required_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the god admin was created
SELECT 
    user_id,
    email,
    role,
    is_god_admin,
    permissions
FROM admin_users
WHERE user_id = 'ebd0b097-4a66-4597-804f-ff3a5bbdadd6';

-- Success message
SELECT 'God admin user created successfully!' as status,
       'Suvodkc@gmail.com' as email,
       'ebd0b097-4a66-4597-804f-ff3a5bbdadd6' as user_id;
