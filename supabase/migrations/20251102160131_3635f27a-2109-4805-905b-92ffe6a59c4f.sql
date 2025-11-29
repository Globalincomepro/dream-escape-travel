-- Create scheduled_posts table
CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content_library(id) ON DELETE SET NULL,
  custom_caption TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed', 'cancelled')),
  platforms TEXT[] NOT NULL,
  zapier_webhook_url TEXT NOT NULL,
  posted_at TIMESTAMPTZ,
  error_message TEXT,
  analytics_tracked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ambassador_content table
CREATE TABLE public.ambassador_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video')),
  caption TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social_post_analytics table
CREATE TABLE public.social_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
  ambassador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin')),
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_posts
CREATE POLICY "Ambassadors can manage own scheduled posts"
ON public.scheduled_posts
FOR ALL
TO authenticated
USING (auth.uid() = ambassador_id)
WITH CHECK (auth.uid() = ambassador_id);

CREATE POLICY "Admins can view all scheduled posts"
ON public.scheduled_posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ambassador_content
CREATE POLICY "Ambassadors can manage own content"
ON public.ambassador_content
FOR ALL
TO authenticated
USING (auth.uid() = ambassador_id)
WITH CHECK (auth.uid() = ambassador_id);

CREATE POLICY "Admins can view all ambassador content"
ON public.ambassador_content
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for social_post_analytics
CREATE POLICY "Ambassadors can view own analytics"
ON public.social_post_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = ambassador_id);

CREATE POLICY "Admins can view all analytics"
ON public.social_post_analytics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert analytics"
ON public.social_post_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_scheduled_posts_updated_at
BEFORE UPDATE ON public.scheduled_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for ambassador content
INSERT INTO storage.buckets (id, name, public)
VALUES ('ambassador-content', 'ambassador-content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ambassador-content bucket
CREATE POLICY "Ambassadors can upload own content"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ambassador-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Ambassadors can view own content"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ambassador-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Ambassadors can delete own content"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ambassador-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view ambassador content"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ambassador-content');