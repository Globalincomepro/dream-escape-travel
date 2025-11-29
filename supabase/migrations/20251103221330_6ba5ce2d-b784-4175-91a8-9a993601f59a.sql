-- Add zapier_webhook_url column to ambassador_funnels table
ALTER TABLE public.ambassador_funnels 
ADD COLUMN zapier_webhook_url TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN public.ambassador_funnels.zapier_webhook_url IS 'Zapier webhook URL for automated social media posting';