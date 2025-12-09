-- Add intent column to leads table to track whether prospect wants to join now or needs more info
ALTER TABLE leads ADD COLUMN intent TEXT;