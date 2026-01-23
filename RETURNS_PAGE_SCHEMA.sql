-- 1. Returns Page Settings (Singleton)
CREATE TABLE IF NOT EXISTS returns_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Hero Section
    hero_title TEXT DEFAULT 'Centurion Returns',
    hero_subtitle TEXT DEFAULT 'We want you to love your purchase. That is why we offer free shipping on all exchanges and returns for store credit.',
    hero_image_url TEXT, -- Background image
    
    -- Step 1
    step_1_title TEXT DEFAULT 'Start Your Return',
    step_1_desc TEXT DEFAULT 'Click the button below to start your return. You will need your order number and email.',
    
    -- Step 2
    step_2_title TEXT DEFAULT 'Get Your Label',
    step_2_desc TEXT DEFAULT 'Follow the steps to select your item and get a prepaid shipping label.',
    
    -- Step 3
    step_3_title TEXT DEFAULT 'Pack & Ship',
    step_3_desc TEXT DEFAULT 'Pack your items with the label and drop it off at any courier location.',

    -- Content
    policy_html TEXT DEFAULT '<p>Items must be returned within 30 days of delivery...</p>',
    start_return_url TEXT DEFAULT '#',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one row exists
CREATE UNIQUE INDEX IF NOT EXISTS one_row_only_uidx ON returns_page_settings((TRUE));

-- RLS
ALTER TABLE returns_page_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Settings" ON returns_page_settings FOR SELECT USING (true);
CREATE POLICY "Admin Update Settings" ON returns_page_settings FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admin Insert Settings" ON returns_page_settings FOR INSERT WITH CHECK (auth.role() = 'service_role');


-- 2. Returns FAQs
CREATE TABLE IF NOT EXISTS returns_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE returns_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read FAQs" ON returns_faqs FOR SELECT USING (true);
CREATE POLICY "Admin All FAQs" ON returns_faqs FOR ALL USING (auth.role() = 'service_role');


-- 3. Seed Default Data (Safety check)
INSERT INTO returns_page_settings (hero_title) 
VALUES ('Centurion Returns') 
ON CONFLICT DO NOTHING;

INSERT INTO returns_faqs (question, answer, sort_order) VALUES
('What is your return window?', 'We accept returns within 30 days of the delivery date.', 1),
('Is shipping free?', 'Returns for store credit and exchanges are free. Refunds to original payment method incur a small handling fee.', 2),
('How long does it take?', 'Once we receive your return, please allow 3-5 business days for processing.', 3)
ON CONFLICT DO NOTHING;
