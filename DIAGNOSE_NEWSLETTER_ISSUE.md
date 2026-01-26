# Quick Diagnosis: Why Newsletter Emails Aren't Delivering

## Step 1: Check Server Terminal Logs

When you subscribe, look for these log messages in your Next.js server terminal:

**Expected logs:**
```
[NEWSLETTER] Attempting to send welcome email to: your@email.com
[NEWSLETTER] sendWelcomeEmailInternal called for: your@email.com
[NEWSLETTER] Calling sendZeptoMail...
[ZEPTOMAIL] API Key present: true
[ZEPTOMAIL] From Email: noreply@centurionshoppe.com
[ZEPTOMAIL] To: your@email.com
[ZEPTOMAIL] Subject: Welcome to Centurion!
[ZEPTOMAIL] Sending request to ZeptoMail API...
[ZEPTOMAIL] Response status: 200 OK
[ZEPTOMAIL] Response data: {...}
[ZEPTOMAIL] Email sent successfully! Message ID: ...
[NEWSLETTER] sendZeptoMail result: { success: true }
[NEWSLETTER] Welcome email sent successfully to: your@email.com
```

## Step 2: Check What You Actually See

**If you see:**
- `[ZEPTOMAIL] API Key present: false` → API key not loaded (restart server)
- `[ZEPTOMAIL] Response status: 401` → Wrong API key
- `[ZEPTOMAIL] Response status: 403` → Domain not verified
- `[ZEPTOMAIL] Response status: 400` → Invalid request format
- `[ZEPTOMAIL] API error` → Check the error message shown

## Step 3: Check Database

Run this SQL in Supabase:

```sql
-- Check if subscription was saved
SELECT * FROM newsletter_subscribers 
WHERE email = 'your@email.com';

-- Check if email send was attempted
SELECT * FROM newsletter_sends 
WHERE recipient_email = 'your@email.com' 
ORDER BY sent_at DESC 
LIMIT 5;
```

**What to look for:**
- Is your email in `newsletter_subscribers`? (subscription worked)
- Is there an entry in `newsletter_sends`? (email function was called)
- What's the `status`? (`sent` = success, `failed` = check `error_message`)
- What's in `error_message`? (tells you why it failed)

## Step 4: Common Issues

### Issue 1: No Logs at All
**Cause:** Subscription function not being called
**Check:** Browser console for JavaScript errors

### Issue 2: "API Key present: false"
**Cause:** Environment variable not loaded
**Fix:** Restart Next.js server

### Issue 3: "Response status: 401"
**Cause:** Wrong API key or wrong authorization format
**Check:** `.env.local` has correct API key

### Issue 4: "Response status: 400"
**Cause:** Invalid email format or API request structure
**Check:** Email address format, API request body

### Issue 5: Response is not JSON
**Cause:** ZeptoMail API might return non-JSON error
**Check:** Server logs for the actual response

## Step 5: Quick Test

1. Subscribe with your email
2. Immediately check server terminal for `[ZEPTOMAIL]` logs
3. Check Supabase `newsletter_sends` table
4. Share what you see:
   - Server log messages
   - Database entry status and error_message

This will tell us exactly what's failing!
