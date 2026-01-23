-- Delivery/Shipping Promotional Section for Homepage
-- Run this in Supabase SQL Editor

-- Create table for homepage delivery section
CREATE TABLE IF NOT EXISTS homepage_delivery_section (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Support crafted for a seamless wedding day',
  button_text TEXT NOT NULL DEFAULT 'SHOP WEDDING',
  button_link TEXT NOT NULL DEFAULT '/all-products',
  shipping_text TEXT NOT NULL DEFAULT 'Free shipping on ₹100 and 30-day hassle-free returns',
  left_image_url TEXT,
  right_image_url TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE homepage_delivery_section ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Public can view delivery section"
  ON homepage_delivery_section FOR SELECT
  TO public
  USING (is_enabled = TRUE);

-- RLS Policies - Admin can manage
CREATE POLICY "Admins can manage delivery section"
  ON homepage_delivery_section FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Insert default section (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM homepage_delivery_section LIMIT 1) THEN
    INSERT INTO homepage_delivery_section (
      title,
      button_text,
      button_link,
      shipping_text,
      left_image_url,
      right_image_url,
      is_enabled
    ) VALUES (
      'Support crafted for a seamless wedding day',
      'SHOP WEDDING',
      '/all-products',
      'Free shipping on ₹100 and 30-day hassle-free returns',
      NULL,
      NULL,
      TRUE
    );
  END IF;
END $$;
