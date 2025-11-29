-- Add preferred_contact_time column to leads table
ALTER TABLE public.leads 
ADD COLUMN preferred_contact_time TEXT;