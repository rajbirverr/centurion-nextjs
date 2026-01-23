-- Homepage Sets Section Schema
-- Run this in Supabase SQL Editor

-- Create table for homepage sets section
CREATE TABLE IF NOT EXISTS homepage_sets_section (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Just for you - we have sets',
  button_text TEXT NOT NULL DEFAULT 'SHOP BEST SELLERS',
  button_link TEXT NOT NULL DEFAULT '/all-products',
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for filter tabs
CREATE TABLE IF NOT EXISTS homepage_sets_filters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL,
  category_slug TEXT, -- Links to category slug (e.g., 'sets')
  link_url TEXT, -- Custom link URL (e.g., '/all-products?category=sets')
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE, -- First enabled filter is shown by default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE homepage_sets_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sets_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Public can view sets section"
  ON homepage_sets_section FOR SELECT
  TO public
  USING (is_enabled = TRUE);

CREATE POLICY "Public can view sets filters"
  ON homepage_sets_filters FOR SELECT
  TO public
  USING (is_enabled = TRUE);

-- RLS Policies - Admin can manage
CREATE POLICY "Admins can manage sets section"
  ON homepage_sets_section FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Admins can manage sets filters"
  ON homepage_sets_filters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Insert default section
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM homepage_sets_section LIMIT 1) THEN
    INSERT INTO homepage_sets_section (
      title,
      button_text,
      button_link,
      is_enabled
    ) VALUES (
      'Just for you - we have sets',
      'SHOP BEST SELLERS',
      '/all-products',
      TRUE
    );
  END IF;
END $$;

-- Insert default filters (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM homepage_sets_filters LIMIT 1) THEN
    INSERT INTO homepage_sets_filters (label, category_slug, link_url, display_order, is_enabled, is_default) VALUES
      ('SETS', 'sets', '/all-products?category=sets', 1, TRUE, TRUE),
      ('CURATED COMBOS', NULL, '/all-products', 2, TRUE, FALSE),
      ('MATCHING SETS', NULL, '/all-products', 3, TRUE, FALSE);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_homepage_sets_filters_order ON homepage_sets_filters(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sets_filters_enabled ON homepage_sets_filters(is_enabled);
