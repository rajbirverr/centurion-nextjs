# Supabase Setup Checklist - FINAL FIX

## Critical Configuration (Must Match Exactly)

### 1. Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
http://localhost:3000
```
- No trailing slash
- Exact match

**Redirect URLs (Add BOTH):**
```
http://localhost:3000/reset-password
http://localhost:3000/**
```
- Add both URLs
- No trailing slashes
- Exact matches

### 2. Verify in Code

The code uses: `http://localhost:3000/reset-password`

Make sure it matches exactly what you added in Supabase.

### 3. Test Flow

1. Go to `/login`
2. Click "Forgot your password?"
3. Enter email: `rajatvermauf@gmail.com`
4. Check email
5. Click the reset link
6. URL should be: `http://localhost:3000/reset-password#access_token=xxx&type=recovery&refresh_token=yyy`
7. If tokens are in URL → working!
8. If no tokens → redirect URL doesn't match

## If Still Not Working

Use Supabase Dashboard to reset password directly (for now), then we'll fix email flow later.

