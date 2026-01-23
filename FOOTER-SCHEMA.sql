-- Footer Management Schema
-- Run this in Supabase SQL Editor to create footer management tables

-- 1. Footer Sections Table
CREATE TABLE IF NOT EXISTS footer_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(position)
);

-- 2. Footer Links Table
CREATE TABLE IF NOT EXISTS footer_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID REFERENCES footer_sections(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Social Media Links Table
CREATE TABLE IF NOT EXISTS footer_social_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE, -- 'instagram', 'facebook', 'twitter', 'youtube', 'tiktok'
  url TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Footer Settings Table (for newsletter, brand name, etc.)
CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_footer_links_section_id ON footer_links(section_id);
CREATE INDEX IF NOT EXISTS idx_footer_links_position ON footer_links(position);
CREATE INDEX IF NOT EXISTS idx_footer_sections_position ON footer_sections(position);

-- Enable RLS
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Public can view footer sections"
  ON footer_sections FOR SELECT
  TO public
  USING (is_enabled = TRUE);

CREATE POLICY "Public can view footer links"
  ON footer_links FOR SELECT
  TO public
  USING (is_enabled = TRUE);

CREATE POLICY "Public can view social media"
  ON footer_social_media FOR SELECT
  TO public
  USING (is_enabled = TRUE);

CREATE POLICY "Public can view footer settings"
  ON footer_settings FOR SELECT
  TO public
  USING (true);

-- RLS Policies - Admin can manage everything
CREATE POLICY "Admins can manage footer sections"
  ON footer_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Admins can manage footer links"
  ON footer_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Admins can manage social media"
  ON footer_social_media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Admins can manage footer settings"
  ON footer_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Insert default footer sections
INSERT INTO footer_sections (title, position, is_enabled) VALUES
  ('HELP', 1, TRUE),
  ('STAY IN THE KNOW', 2, TRUE),
  ('MORE', 3, TRUE)
ON CONFLICT (position) DO NOTHING;

-- Insert default footer settings (only if they don't exist)
DO $$
BEGIN
  INSERT INTO footer_settings (key, value) VALUES
    ('brand_name', 'Centurion'),
    ('newsletter_enabled', 'true'),
    ('newsletter_description', 'Be the first to discover new drops, special offers, and all things Centurion'),
    ('sms_enabled', 'false'),
    ('sms_text', 'Text CENTURION to 68805 to never miss a drop!'),
    ('sms_number', '68805'),
    ('copyright_text', 'All Rights Reserved.')
  ON CONFLICT (key) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if settings already exist
  NULL;
END $$;

-- Insert default social media platforms (disabled by default)
INSERT INTO footer_social_media (platform, url, is_enabled) VALUES
  ('instagram', '#', FALSE),
  ('facebook', '#', FALSE),
  ('twitter', '#', FALSE),
  ('youtube', '#', FALSE),
  ('tiktok', '#', FALSE)
ON CONFLICT (platform) DO NOTHING;
