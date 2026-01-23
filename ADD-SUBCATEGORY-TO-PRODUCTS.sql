-- Add subcategory_id column to products table
-- Run this in Supabase SQL Editor to enable subcategory assignment for products

-- Add the column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES category_subcategories(id) ON DELETE SET NULL;

-- Create index for faster subcategory filtering
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id) WHERE subcategory_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.subcategory_id IS 'Optional subcategory for more granular product organization. Links products to subcategories within their category.';

-- Verify the column was added (optional check)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'subcategory_id';
