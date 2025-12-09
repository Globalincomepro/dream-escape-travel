-- Drop the foreign key constraint that's causing the issue
ALTER TABLE public.scheduled_posts 
DROP CONSTRAINT IF EXISTS scheduled_posts_content_id_fkey;

-- Add columns to store content details directly in scheduled_posts
ALTER TABLE public.scheduled_posts
ADD COLUMN IF NOT EXISTS content_file_url TEXT,
ADD COLUMN IF NOT EXISTS content_thumbnail_url TEXT;

-- Update existing records to copy data from content_library if they have a content_id
UPDATE public.scheduled_posts sp
SET 
  content_file_url = cl.file_url,
  content_thumbnail_url = cl.thumbnail_url
FROM public.content_library cl
WHERE sp.content_id = cl.id
  AND sp.content_file_url IS NULL;

-- Now make content_file_url NOT NULL (after we've populated it for existing rows)
ALTER TABLE public.scheduled_posts
ALTER COLUMN content_file_url SET NOT NULL;