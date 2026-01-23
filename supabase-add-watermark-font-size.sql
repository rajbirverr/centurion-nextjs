-- Add watermark_font_size column to products table
-- This allows per-product watermark font size customization

ALTER TABLE products
ADD COLUMN IF NOT EXISTS watermark_font_size INTEGER;

-- Add comment
COMMENT ON COLUMN products.watermark_font_size IS 'Per-product watermark font size in pixels (optional - uses global default if not set)';

