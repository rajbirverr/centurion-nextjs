-- Check if welcome email was sent for your email
-- Run this in Supabase SQL Editor

-- 1. Check subscriber status
SELECT * FROM newsletter_subscribers 
WHERE email = 'rajatvermauf@gmail.com';

-- 2. Check if welcome email was attempted
SELECT * FROM newsletter_sends 
WHERE recipient_email = 'rajatvermauf@gmail.com' 
  AND template_type = 'welcome'
ORDER BY sent_at DESC 
LIMIT 5;

-- 3. Check ALL email sends for your email
SELECT * FROM newsletter_sends 
WHERE recipient_email = 'rajatvermauf@gmail.com' 
ORDER BY sent_at DESC 
LIMIT 10;
