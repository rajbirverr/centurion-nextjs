-- Disable Email Confirmation (For Development Only!)
-- ⚠️ WARNING: Only use this in development, NOT in production!
-- Run this in Supabase SQL Editor

-- This disables the requirement for users to confirm their email before logging in
-- Go to Supabase Dashboard → Authentication → Settings → Email Auth
-- And disable "Confirm email" toggle

-- OR use this SQL to update the auth configuration:
-- Note: This might not work in all Supabase plans - use the Dashboard method instead

-- Better method: Use Supabase Dashboard
-- 1. Go to: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to: Authentication → Settings
-- 4. Under "Email Auth" section
-- 5. Toggle OFF "Confirm email"
-- 6. Click "Save"

-- This will allow users to log in immediately after signup without email confirmation

