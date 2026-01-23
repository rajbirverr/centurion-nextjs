-- Add watermark_text column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS watermark_text TEXT;

COMMENT ON COLUMN products.watermark_text IS 'Per-product watermark text (optional - uses global default if not set)';

