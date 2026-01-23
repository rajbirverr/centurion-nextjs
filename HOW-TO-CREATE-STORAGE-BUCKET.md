# How to Create Supabase Storage Bucket for Hero Images

## Quick Solution: Use URL Mode Instead

**Easiest option:** Instead of uploading files, use the **"Enter URL"** mode in the admin dashboard:
1. Go to `/admin/dashboard`
2. Click **"Enter URL"** button
3. Paste your image URL (e.g., `/nobackgroundimage/forever.png` or any full URL)
4. Click **"Save Hero Image"**

This works immediately without needing to set up storage!

---

## Option 2: Create Storage Bucket (For File Uploads)

If you want to upload files directly, follow these steps:

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click **"Storage"** in the left sidebar

### Step 2: Create New Bucket
1. Click **"New bucket"** button (top right)
2. Enter bucket name: `images`
3. **Bucket visibility options:**
   - **Public bucket (Recommended):** Check this for hero images that need to be publicly accessible. Anyone can view images via direct URL.
   - **Private bucket:** Don't check this. Private buckets require authentication tokens and need signed URLs, which requires additional code changes.
4. Click **"Create bucket"**

### Step 3: Set Up Bucket Policies (Optional but Recommended)

Go to **Storage** → **Policies** → Select `images` bucket

Add these policies:

**Policy 1: Allow public read access**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

**Policy 2: Allow authenticated users to upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

**Policy 3: Allow authenticated users to update**
```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');
```

**Policy 4: Allow authenticated users to delete**
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
```

### Step 4: Test
After creating the bucket, try uploading a hero image again from `/admin/dashboard`.

---

## Troubleshooting

**If you still get "bucket not found" error:**
- Make sure the bucket name is exactly `images` (lowercase, no spaces)
- Make sure the bucket is set to **Public**
- Refresh the admin dashboard page
- Check that you're logged in as an admin user

**If upload works but image doesn't display:**
- Make sure the bucket is set to **Public**
- Check the bucket policies allow public read access

