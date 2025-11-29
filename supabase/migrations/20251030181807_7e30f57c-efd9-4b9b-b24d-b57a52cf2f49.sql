-- Create funnel_gallery_images table
CREATE TABLE public.funnel_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL REFERENCES public.ambassador_funnels(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  location text NOT NULL,
  caption text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funnel_gallery_images ENABLE ROW LEVEL SECURITY;

-- Ambassadors can manage their own gallery images
CREATE POLICY "Ambassadors manage own gallery images"
  ON public.funnel_gallery_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ambassador_funnels
      WHERE id = funnel_gallery_images.funnel_id
      AND user_id = auth.uid()
    )
  );

-- Anyone can view gallery images for active funnels
CREATE POLICY "Anyone can view gallery images"
  ON public.funnel_gallery_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ambassador_funnels
      WHERE id = funnel_gallery_images.funnel_id
      AND is_active = true
    )
  );

-- Add indexes for performance
CREATE INDEX idx_funnel_gallery_images_funnel_id ON public.funnel_gallery_images(funnel_id);
CREATE INDEX idx_funnel_gallery_images_sort_order ON public.funnel_gallery_images(funnel_id, sort_order);

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- RLS policies for gallery-images bucket
CREATE POLICY "Ambassadors can upload gallery images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND has_role(auth.uid(), 'ambassador')
  );

CREATE POLICY "Ambassadors can update own gallery images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'gallery-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Ambassadors can delete own gallery images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'gallery-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view gallery images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery-images');