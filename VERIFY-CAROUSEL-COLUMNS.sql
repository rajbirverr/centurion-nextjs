-- Verify that carousel columns exist in products table
-- Run this in Supabase SQL Editor to check

-- Check if columns exist
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('in_shine_carousel', 'in_drip_carousel', 'in_category_carousel');

-- Check products with carousel flags set
SELECT 
  id, 
  name, 
  status,
  in_shine_carousel, 
  in_drip_carousel, 
  in_category_carousel
FROM products 
WHERE in_shine_carousel = true 
   OR in_drip_carousel = true 
   OR in_category_carousel = true;

