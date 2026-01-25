-- Add sale page fields to products table
-- Run this in Supabase SQL Editor

-- Add columns for sale page
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS in_sale_page BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_in_sale_page ON products(in_sale_page) WHERE in_sale_page = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN products.in_sale_page IS 'If true, product appears on the sale page';
COMMENT ON COLUMN products.discount_percentage IS 'Discount percentage (0-100) to apply on sale page';
