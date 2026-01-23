-- Add watermark_color column to products table
-- This allows per-product watermark color customization

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS watermark_color TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN products.watermark_color IS 'Optional custom watermark color for this product (hex format, e.g., #784D2C). If not set, uses global watermark color.';

