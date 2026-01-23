-- Reset Password Using Supabase Admin (This won't work - passwords can't be set via SQL)
-- Instead, use one of the methods below

-- METHOD 1: Use Supabase Dashboard (EASIEST)
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Find the user: rajatvermauf@gmail.com
-- 3. Click on the user row
-- 4. Click "Reset Password" button
-- 5. Enter new password: Rajat101995@
-- 6. Save

-- METHOD 2: Use Password Reset Flow (RECOMMENDED)
-- 1. On your login page, click "Forgot your password?"
-- 2. Enter: rajatvermauf@gmail.com
-- 3. Check your email for reset link
-- 4. Set new password

-- METHOD 3: Update via Admin API (Requires code)
-- This needs to be done programmatically - passwords are hashed and can't be set via SQL

-- Note: Passwords are encrypted and cannot be viewed or set directly via SQL
-- You MUST use Supabase's password reset functionality

