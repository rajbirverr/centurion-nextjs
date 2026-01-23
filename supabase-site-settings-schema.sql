-- Create site_settings table for storing site configuration
-- Run this in Supabase SQL Editor if the table doesn't exist

-- Create the site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on setting_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_setting_key ON public.site_settings(setting_key);

-- Enable RLS (Row Level Security)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to site_settings"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow admin write access
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

-- Add comment to document the table
COMMENT ON TABLE public.site_settings IS 'Stores site-wide configuration settings like hero images';
COMMENT ON COLUMN public.site_settings.setting_key IS 'Unique key for the setting (e.g., "hero_image")';
COMMENT ON COLUMN public.site_settings.hero_image_url IS 'URL or path to the hero image';

