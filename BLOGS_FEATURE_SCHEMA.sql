
-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT, -- HTML content from rich text editor
    featured_image TEXT,
    category TEXT DEFAULT 'All',
    author TEXT DEFAULT 'Centurion Edit',
    published_at TIMESTAMP WITH TIME ZONE, -- If null, it's a draft
    is_featured BOOLEAN DEFAULT FALSE,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_products table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS blog_products (
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (blog_id, product_id)
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_products ENABLE ROW LEVEL SECURITY;

-- Categories Enum / Check (Optional, but good for consistency)
-- For now allowing free text but default logic uses 'ADVICE', 'STYLE', 'WOMEN', 'TRENDS'

-- Policies for blogs
-- Public can view published blogs
CREATE POLICY "Public can view published blogs" 
ON blogs FOR SELECT 
TO public 
USING (published_at IS NOT NULL AND published_at <= NOW());

-- Admins can view/edit all blogs (Service Role or Admin User)
-- Simple policy assuming service_role client usage for updates or basic authenticated usage
CREATE POLICY "Admins can do everything with blogs" 
ON blogs 
USING (true) 
WITH CHECK (true);

-- Policies for blog_products
CREATE POLICY "Public can view blog products" 
ON blog_products FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Admins can do everything with blog products" 
ON blog_products 
USING (true) 
WITH CHECK (true);

-- Functions
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
