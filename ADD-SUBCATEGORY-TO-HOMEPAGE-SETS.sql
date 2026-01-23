-- Add subcategory_slug column to homepage_sets_filters table
-- Run this in Supabase SQL Editor

ALTER TABLE homepage_sets_filters 
ADD COLUMN IF NOT EXISTS subcategory_slug TEXT DEFAULT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'homepage_sets_filters';
