# Password Reset Workaround

Since the email reset link isn't working, here's a quick workaround:

## Option 1: Reset Password via Supabase Dashboard (FASTEST)

1. Go to Supabase Dashboard → Authentication → Users
2. Find your user: `rajatvermauf@gmail.com`
3. Click on the user row
4. Click the **"..."** menu (three dots) or look for **"Reset Password"** button
5. Enter new password: `Rajat101995@`
6. Save

This will immediately reset your password and you can log in!

## Option 2: Check Email Link Format

The email link should look like one of these:

**Format 1 (Supabase hosted):**
```
https://your-project-id.supabase.co/auth/v1/verify?token=xxx&type=recovery&redirect_to=http://localhost:3000/reset-password
```

**Format 2 (Direct redirect):**
```
http://localhost:3000/reset-password#access_token=xxx&type=recovery&refresh_token=yyy
```

**If your email link looks like Format 1:**
- It goes to Supabase's hosted page first
- That page should redirect to your site with tokens
- If it doesn't redirect with tokens, the redirect URL isn't configured correctly

**If your email link looks like Format 2:**
- It should work directly
- If tokens are missing, Supabase isn't including them

## Option 3: Use Supabase Admin API (For Development)

I can create an admin function to reset passwords directly, but this requires the service role key and should only be used in development.

## What to Check Right Now

1. **What does the email link URL look like?** (Right-click → Copy Link)
2. **What does the browser console show?** (F12 → Console tab when you click the link)
3. **Is Site URL exactly:** `http://localhost:3000` (no trailing slash)?
4. **Is redirect URL exactly:** `http://localhost:3000/reset-password` (no trailing slash)?

For now, use **Option 1** to reset your password so you can log in, and we'll fix the email flow after.

