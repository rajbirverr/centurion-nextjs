-- Create Missing Profile for Existing User
-- Run this to create the profile for rajatvermauf@gmail.com

-- Simple version: Just create the profile with the user ID directly
-- We know the user ID from the screenshot: 9c1b4660-4372-4ef0-9c45-9116bb92ec20
INSERT INTO public.profiles (
  id,
  display_name,
  first_name,
  last_name,
  role
)
VALUES (
  '9c1b4660-4372-4ef0-9c45-9116bb92ec20',
  'Rajat verma',
  'Rajat',
  'verma',
  'customer'
)
ON CONFLICT (id) DO UPDATE
SET
  display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
  role = 'customer';

-- 3. Verify the profile was created
SELECT 
  p.id,
  p.display_name,
  p.first_name,
  p.last_name,
  p.role,
  u.email
FROM public.profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE u.email = 'rajatvermauf@gmail.com';

