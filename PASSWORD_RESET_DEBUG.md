# Password Reset Debug Guide

## Critical Checks

### 1. Check the Email Link Format

When you receive the password reset email, **right-click** on the reset link and **"Copy Link Address"** or **"Copy Link Location"**.

The link should look like one of these:

**✅ CORRECT Format (with tokens):**
```
https://your-project.supabase.co/auth/v1/verify?token=xxx&type=recovery&redirect_to=http://localhost:3000/reset-password
```

**OR:**

```
http://localhost:3000/reset-password#access_token=eyJhbGc...&type=recovery&refresh_token=xxx...
```

**❌ WRONG Format (no tokens):**
```
http://localhost:3000/reset-password
```
(Just the URL with no tokens = wrong)

### 2. Supabase Email Template Configuration

The issue might be in the **email template** itself. Check:

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Find the **"Reset Password"** template
3. Check the **"Redirect to"** URL in the template
4. Make sure it includes your redirect URL: `{{ .ConfirmationURL }}` or `{{ .SiteURL }}/reset-password`

### 3. Site URL Must Match

In Supabase Dashboard → **Authentication** → **URL Configuration**:
- **Site URL**: Must be `http://localhost:3000` (no trailing slash)
- **Redirect URLs**: Should include `http://localhost:3000/reset-password` (exact match)

### 4. Check Browser Console

When you click the reset link:
1. Open Browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for the debug logs I added:
   - "Full URL: ..."
   - "URL Hash: ..."
   - "Tokens found: ..."

This will tell us exactly what URL you're landing on.

### 5. Common Issues

**Issue 1: Email Template Not Using Redirect URL**
- The email template might be using a hardcoded URL instead of the redirect_to parameter
- Solution: Update email template to use `{{ .ConfirmationURL }}`

**Issue 2: Redirect URL Mismatch**
- The redirect URL in code must match exactly (including http vs https, trailing slashes)
- Solution: Make sure both are exactly: `http://localhost:3000/reset-password`

**Issue 3: Site URL Not Set**
- Site URL must be set in Supabase
- Solution: Set it to `http://localhost:3000`

## Quick Test

1. Check the email link URL (right-click → Copy Link)
2. Share what the URL looks like
3. Check browser console logs when you click the link
4. Share what you see in the console

This will help us identify the exact problem!

