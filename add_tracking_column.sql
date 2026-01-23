-- Migration to add tracking_number and tracking_url to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS courier_name TEXT DEFAULT 'Delhivery';

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
