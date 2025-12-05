-- Add currency column to tontines table
ALTER TABLE public.tontines 
ADD COLUMN currency text NOT NULL DEFAULT 'KMF';

-- Add check constraint for allowed currencies
ALTER TABLE public.tontines 
ADD CONSTRAINT tontines_currency_check 
CHECK (currency IN ('KMF', 'EUR', 'USD', 'MGA'));