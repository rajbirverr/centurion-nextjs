-- Check User Account Status
-- Run this in Supabase SQL Editor to verify your account exists and check its status

-- Replace 'rajatvermauf@gmail.com' with your email if different
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users
WHERE email = 'rajatvermauf@gmail.com';

-- Check if profile exists for this user
SELECT 
  p.id,
  p.display_name,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at
FROM public.profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE u.email = 'rajatvermauf@gmail.com';

