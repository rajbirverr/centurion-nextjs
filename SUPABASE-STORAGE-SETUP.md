# Supabase Storage Setup for Category/Subcategory Images

## Issue: Images Not Showing

If images are not displaying, check the following:

## Step 1: Verify Storage Bucket Exists

1. Go to your **Supabase Dashboard**
2. Click **"Storage"** in the left sidebar
3. Check if a bucket named **`images`** exists
4. If it doesn't exist, create it:
   - Click **"New bucket"**
   - Name: `images`
   - **IMPORTANT:** Check **"Public bucket"** ✅
   - Click **"Create bucket"**

## Step 2: Set Up Public Access Policy

1. In Supabase Dashboard, go to **Storage** → **Policies**
2. Select the **`images`** bucket
3. Click **"New Policy"** → **"For full customization"**

### Policy 1: Public Read Access (REQUIRED)

```sql
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

**Why this is needed:** Without this policy, images uploaded to Supabase Storage won't be publicly accessible, and browsers will block them.

### Policy 2: Authenticated Upload (For Admin)

```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

### Policy 3: Authenticated Update (For Admin)

```sql
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');
```

### Policy 4: Authenticated Delete (For Admin)

```sql
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
```

## Step 3: Verify Bucket is Public

1. Go to **Storage** → **Buckets**
2. Click on the **`images`** bucket
3. Check that **"Public bucket"** is enabled ✅
4. If not, click the settings icon and enable it

## Step 4: Test Image URL

1. Upload a test image through the admin panel
2. Copy the image URL from the database
3. Open the URL directly in a new browser tab
4. If you see the image → Storage is configured correctly ✅
5. If you get an error → Check policies and bucket settings

## Step 5: Restart Next.js Server

After making changes to Supabase:
1. Stop your Next.js dev server (Ctrl+C)
2. Restart it: `npm run dev` or `yarn dev`

## Step 6: Check Next.js Config

Make sure `next.config.ts` includes:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
    {
      protocol: 'https',
      hostname: '**.supabase.in',
    },
  ],
},
```

## Troubleshooting

### Images still not showing?

1. **Check browser console** for CORS errors
2. **Check Network tab** - is the image request failing?
3. **Verify image URL format**: Should be like `https://[project].supabase.co/storage/v1/object/public/images/categories/[filename]`
4. **Check if bucket is actually public**: Try accessing an image URL directly in browser
5. **Verify RLS policies**: Make sure the public read policy is active

### Quick Test

Run this SQL in Supabase SQL Editor to check if images bucket exists:

```sql
SELECT name, public FROM storage.buckets WHERE name = 'images';
```

Should return:
- `name`: `images`
- `public`: `true`

## Alternative: Use External Image URLs

If Supabase Storage setup is complex, you can:
1. Upload images to a service like Cloudinary, Imgur, or your own CDN
2. Use the **"Enter URL"** mode in the admin panel
3. Paste the external image URL directly

This bypasses Supabase Storage entirely.
