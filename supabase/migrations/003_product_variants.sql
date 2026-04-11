-- 003_product_variants.sql

-- Alter products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_physical BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Alter orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS variant_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

http://52.23.161.68:80/docs