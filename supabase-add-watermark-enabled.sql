-- Add watermark_enabled column to products table
-- This allows per-product control of watermark display

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS watermark_enabled BOOLEAN DEFAULT true;

-- Update existing products to have watermark enabled by default
UPDATE products 
SET watermark_enabled = true 
WHERE watermark_enabled IS NULL;

-- Add a comment for clarity
COMMENT ON COLUMN products.watermark_enabled IS 'Whether to show watermark overlay on this product''s images (defaults to true)';

