-- Add crop_settings column to product_images table
-- Run this in Supabase SQL Editor

-- Add crop_settings JSONB column to store crop positioning
ALTER TABLE public.product_images
ADD COLUMN IF NOT EXISTS crop_settings JSONB;

-- Add comment to document the structure
COMMENT ON COLUMN public.product_images.crop_settings IS 'Stores crop positioning settings: { "x": number (0-100), "y": number (0-100), "enabled": boolean }';

