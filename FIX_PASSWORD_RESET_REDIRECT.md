# Fix Password Reset Redirect Issue

## Problem
Password reset links show "Invalid reset link" because Supabase isn't including tokens in the URL.

## Solution
You need to add the reset password URL to Supabase's allowed redirect URLs.

## Step-by-Step Fix

### 1. Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration** (or **Settings** → **Auth** → **URL Configuration**)

### 2. Add Redirect URL
1. Find the **"Redirect URLs"** section
2. Click **"Add URL"** or the **+** button
3. Add this URL:
   - For local development: `http://localhost:3000/reset-password`
   - For production: `https://yourdomain.com/reset-password`
   - Or use wildcard: `http://localhost:3000/**` (allows all localhost:3000 routes)

### 3. Also Check Site URL
Make sure the **Site URL** is set correctly:
- For local development: `http://localhost:3000`
- For production: `https://yourdomain.com`

### 4. Save Settings
- Click **"Save"** or **"Update"**

### 5. Test Again
1. Request a new password reset
2. Check your email
3. Click the reset link
4. The URL should now include tokens like: `http://localhost:3000/reset-password#access_token=xxx&type=recovery&refresh_token=yyy`

## Important Notes

- **Redirect URLs must match exactly** - including `http` vs `https` and the port number
- You can add multiple redirect URLs (one for dev, one for production)
- The redirect URL in your code (`src/lib/actions/auth.ts`) must match one of the allowed URLs
- After adding the URL, request a **new** password reset email (old links won't work)

## Quick Check

After adding the redirect URL, when you click the password reset link from your email, the URL should look like:
```
http://localhost:3000/reset-password#access_token=eyJhbGc...&type=recovery&refresh_token=xxx...
```

If you see the hash fragment (`#access_token=...`), it's working!
If you don't see the hash fragment, the redirect URL isn't configured correctly.

