-- Check and Fix User Account
-- Run this to see all users and confirm the correct email

-- 1. First, check all users to see the exact email
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users
ORDER BY created_at DESC;

-- 2. If you see the user, confirm their email (replace with actual email from step 1)
-- The email might be slightly different, so check the output above first
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'rajatvermauf@gmail.com';

-- 3. Or confirm by user ID (use the ID from step 1)
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE id = '9c1b4660-4372-4ef0-9c45-9116bb92ec20';

-- 4. Verify it worked
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed'
  END as status
FROM auth.users
WHERE email LIKE '%rajat%' OR email LIKE '%verma%';

