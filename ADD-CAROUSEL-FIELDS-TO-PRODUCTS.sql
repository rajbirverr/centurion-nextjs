-- Add carousel flags to products table
-- Run this in Supabase SQL Editor

-- Add columns for tracking which homepage carousels products appear in
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS in_shine_carousel BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS in_drip_carousel BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS in_category_carousel BOOLEAN DEFAULT FALSE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_in_shine_carousel ON products(in_shine_carousel) WHERE in_shine_carousel = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_in_drip_carousel ON products(in_drip_carousel) WHERE in_drip_carousel = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_in_category_carousel ON products(in_category_carousel) WHERE in_category_carousel = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN products.in_shine_carousel IS 'If true, product appears in "The Shine" carousel on homepage';
COMMENT ON COLUMN products.in_drip_carousel IS 'If true, product appears in "Drip for Days Under ₹500" carousel on homepage';
COMMENT ON COLUMN products.in_category_carousel IS 'If true, product appears in "Shop by Category" carousel on homepage';

