-- Add watermark_position column to products table
-- This allows per-product watermark position customization

ALTER TABLE products
ADD COLUMN IF NOT EXISTS watermark_position TEXT 
CHECK (watermark_position IN ('top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right') OR watermark_position IS NULL);

-- Add comment
COMMENT ON COLUMN products.watermark_position IS 'Per-product watermark position (optional - uses global default if not set)';

