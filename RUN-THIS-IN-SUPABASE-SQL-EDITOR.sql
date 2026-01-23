-- ============================================
-- HERO IMAGE SETTINGS TABLE SETUP
-- ============================================
-- Copy and paste ONLY the SQL code below into Supabase SQL Editor
-- Do NOT copy any TypeScript or JavaScript code

-- Step 1: Create the site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_setting_key ON public.site_settings(setting_key);

-- Step 3: Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access to site_settings"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- Step 5: Create policy for admin write access
DROP POLICY IF EXISTS "Allow admin write access to site_settings" ON public.site_settings;
CREATE POLICY "Allow admin write access to site_settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Done! The table is now ready to use.

