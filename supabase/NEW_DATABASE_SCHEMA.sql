-- ============================================================
-- MWR DREAM ESCAPE TRAVEL - COMPLETE DATABASE SCHEMA
-- Run this SQL in your NEW Supabase project's SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: CORE TABLES AND FUNCTIONS
-- ============================================================

-- 1. User profiles (linked to Supabase auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  tagline TEXT,
  bio TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User roles enum and table
CREATE TYPE public.app_role AS ENUM ('prospect', 'guest', 'vip', 'ambassador', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'prospect',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 3. Role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- PART 2: AMBASSADOR SYSTEM TABLES
-- ============================================================

-- 5. Ambassador funnels (personal landing pages)
CREATE TABLE public.ambassador_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  funnel_slug TEXT UNIQUE NOT NULL,
  hero_image_url TEXT,
  custom_headline TEXT DEFAULT 'Transform Your Travel Dreams Into Reality',
  custom_bio TEXT,
  guest_pass_url TEXT DEFAULT 'https://example.com/guest-pass',
  vip_join_url TEXT DEFAULT 'https://example.com/vip-join',
  zapier_webhook_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.ambassador_funnels.zapier_webhook_url IS 'Zapier webhook URL for automated social media posting';

-- 6. Funnel gallery images
CREATE TABLE public.funnel_gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES public.ambassador_funnels(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  location TEXT NOT NULL,
  caption TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pending ambassador applications
CREATE TABLE public.pending_ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  application_note TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 3: LEADS AND ANALYTICS
-- ============================================================

-- 8. Leads tracking
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'prospect',
  source TEXT,
  funnel_slug TEXT,
  intent TEXT,
  notes TEXT,
  preferred_contact_time TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('prospect', 'new', 'interested', 'booked', 'no_show', 'enrolled', 'closed', 'contacted', 'converted'));

-- 9. Funnel analytics events
CREATE TABLE public.funnel_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES auth.users(id),
  funnel_id UUID REFERENCES ambassador_funnels(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Funnel metrics (daily aggregates)
CREATE TABLE public.funnel_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  enrollments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, ambassador_id)
);

-- ============================================================
-- PART 4: CONTENT AND SOCIAL MEDIA
-- ============================================================

-- 11. Content library (shared content for all ambassadors)
CREATE TABLE public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  caption_text TEXT,
  caption_template TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 12. Ambassador's own uploaded content
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

-- 13. Scheduled social media posts
CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content_library(id) ON DELETE SET NULL,
  content_file_url TEXT NOT NULL,
  content_thumbnail_url TEXT,
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

-- 14. Social post analytics
CREATE TABLE public.social_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
  ambassador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin')),
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Shares tracking
CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE NOT NULL,
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('facebook', 'instagram', 'tiktok', 'linkedin', 'x', 'email', 'sms')),
  referral_link TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 5: APPOINTMENTS AND CALENDAR
-- ============================================================

-- 16. Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'canceled', 'no_show')),
  google_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Ambassador calendar connections
CREATE TABLE public.ambassador_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calendar_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 6: SYSTEM SETTINGS
-- ============================================================

-- 18. System settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES 
  ('auto_approve_ambassadors', 'true'::JSONB),
  ('routing_mode', '{"type":"round_robin","default_ambassador_id":null}'::jsonb),
  ('lead_alerts', '{"escalate_after_hours":24,"reminder_after_hours":48}'::jsonb),
  ('calendar_settings', '{"timezone":"America/Chicago","default_duration_minutes":30,"buffer_minutes":15,"business_hours_start":"09:00","business_hours_end":"18:00"}'::jsonb);

-- ============================================================
-- PART 7: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 8: RLS POLICIES
-- ============================================================

-- Profiles policies
CREATE POLICY "Public profiles viewable by everyone" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Ambassador funnels policies
CREATE POLICY "Anyone can view active funnels" ON public.ambassador_funnels FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Ambassadors can create own funnel" ON public.ambassador_funnels FOR INSERT WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'ambassador'));
CREATE POLICY "Ambassadors can update own funnel" ON public.ambassador_funnels FOR UPDATE USING (auth.uid() = user_id);

-- Funnel gallery images policies
CREATE POLICY "Ambassadors manage own gallery images" ON public.funnel_gallery_images FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.ambassador_funnels WHERE id = funnel_gallery_images.funnel_id AND user_id = auth.uid()));
CREATE POLICY "Anyone can view gallery images" ON public.funnel_gallery_images FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ambassador_funnels WHERE id = funnel_gallery_images.funnel_id AND is_active = true));

-- Pending ambassadors policies
CREATE POLICY "Users can view own application" ON public.pending_ambassadors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own application" ON public.pending_ambassadors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage applications" ON public.pending_ambassadors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leads policies
CREATE POLICY "Ambassadors view own leads" ON public.leads FOR SELECT USING (auth.uid() = ambassador_id);
CREATE POLICY "Admins view all leads" ON public.leads FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (TRUE);

-- Analytics policies
CREATE POLICY "Ambassadors view own analytics" ON public.funnel_analytics FOR SELECT USING (auth.uid() = ambassador_id);
CREATE POLICY "Admins view all analytics" ON public.funnel_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert analytics" ON public.funnel_analytics FOR INSERT WITH CHECK (TRUE);

-- Funnel metrics policies
CREATE POLICY "Admins can manage all metrics" ON public.funnel_metrics FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Ambassadors can view own metrics" ON public.funnel_metrics FOR SELECT USING (auth.uid() = ambassador_id OR ambassador_id IS NULL);

-- System settings policies
CREATE POLICY "Everyone can view settings" ON public.system_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins can update settings" ON public.system_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Content library policies
CREATE POLICY "Authenticated users view content" ON public.content_library FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins manage content" ON public.content_library FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Ambassador content policies
CREATE POLICY "Ambassadors can manage own content" ON public.ambassador_content FOR ALL TO authenticated USING (auth.uid() = ambassador_id) WITH CHECK (auth.uid() = ambassador_id);
CREATE POLICY "Admins can view all ambassador content" ON public.ambassador_content FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Scheduled posts policies
CREATE POLICY "Ambassadors can manage own scheduled posts" ON public.scheduled_posts FOR ALL TO authenticated USING (auth.uid() = ambassador_id) WITH CHECK (auth.uid() = ambassador_id);
CREATE POLICY "Admins can view all scheduled posts" ON public.scheduled_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all scheduled posts" ON public.scheduled_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert scheduled posts" ON public.scheduled_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete scheduled posts" ON public.scheduled_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Social post analytics policies
CREATE POLICY "Ambassadors can view own analytics" ON public.social_post_analytics FOR SELECT TO authenticated USING (auth.uid() = ambassador_id);
CREATE POLICY "Admins can view all analytics" ON public.social_post_analytics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert analytics" ON public.social_post_analytics FOR INSERT TO authenticated WITH CHECK (true);

-- Shares policies
CREATE POLICY "Admins can view all shares" ON public.shares FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Ambassadors can view own shares" ON public.shares FOR SELECT USING (auth.uid() = ambassador_id);
CREATE POLICY "Ambassadors can create own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = ambassador_id);
CREATE POLICY "Anyone can update share metrics" ON public.shares FOR UPDATE USING (true) WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Admins can manage all appointments" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Ambassadors can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = ambassador_id);
CREATE POLICY "Ambassadors can create own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = ambassador_id);
CREATE POLICY "Ambassadors can update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = ambassador_id);

-- Ambassador calendars policies
CREATE POLICY "Ambassadors can manage own calendar" ON public.ambassador_calendars FOR ALL USING (auth.uid() = ambassador_id) WITH CHECK (auth.uid() = ambassador_id);

-- ============================================================
-- PART 9: TRIGGERS
-- ============================================================

CREATE TRIGGER update_leads_updated_at_trigger BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ambassador_calendars_updated_at_trigger BEFORE UPDATE ON public.ambassador_calendars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PART 10: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'prospect');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 11: AMBASSADOR PROMOTION FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.promote_to_ambassador(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auto_approve BOOLEAN;
  result JSONB;
BEGIN
  SELECT (setting_value::TEXT::BOOLEAN) INTO auto_approve
  FROM public.system_settings
  WHERE setting_key = 'auto_approve_ambassadors';
  
  IF auto_approve THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'ambassador')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.ambassador_funnels (user_id, funnel_slug)
    SELECT 
      _user_id, 
      LOWER(REPLACE(COALESCE(full_name, 'ambassador'), ' ', '-')) || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)
    FROM public.profiles
    WHERE id = _user_id
    ON CONFLICT (user_id) DO NOTHING;
    
    result := jsonb_build_object('status', 'approved', 'message', 'Ambassador access granted!');
  ELSE
    INSERT INTO public.pending_ambassadors (user_id)
    VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    result := jsonb_build_object('status', 'pending', 'message', 'Application submitted for review');
  END IF;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_ambassador(_admin_id UUID, _user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve ambassadors';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'ambassador')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.ambassador_funnels (user_id, funnel_slug)
  SELECT 
    _user_id,
    LOWER(REPLACE(COALESCE(full_name, 'ambassador'), ' ', '-')) || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)
  FROM public.profiles
  WHERE id = _user_id
  ON CONFLICT (user_id) DO NOTHING;
  
  UPDATE public.pending_ambassadors
  SET status = 'approved', reviewed_by = _admin_id, reviewed_at = NOW()
  WHERE user_id = _user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.bulk_approve_ambassadors(_admin_id UUID, _user_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
  approved_count INT := 0;
BEGIN
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve ambassadors';
  END IF;
  
  FOREACH user_id IN ARRAY _user_ids
  LOOP
    PERFORM public.approve_ambassador(_admin_id, user_id);
    approved_count := approved_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object('approved_count', approved_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_slug_availability(_slug TEXT, _exclude_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.ambassador_funnels
    WHERE funnel_slug = _slug
    AND (_exclude_user_id IS NULL OR user_id != _exclude_user_id)
  )
$$;

-- ============================================================
-- PART 12: STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', TRUE),
  ('hero-images', 'hero-images', TRUE),
  ('content-library', 'content-library', TRUE),
  ('gallery-images', 'gallery-images', TRUE),
  ('ambassador-content', 'ambassador-content', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view hero images" ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');
CREATE POLICY "Ambassadors upload hero images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND public.has_role(auth.uid(), 'ambassador'));

CREATE POLICY "Anyone can view content" ON storage.objects FOR SELECT USING (bucket_id = 'content-library');
CREATE POLICY "Admins manage content" ON storage.objects FOR ALL USING (bucket_id = 'content-library' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view gallery bucket" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');
CREATE POLICY "Ambassadors can upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND (storage.foldername(name))[1] = auth.uid()::text AND has_role(auth.uid(), 'ambassador'));
CREATE POLICY "Ambassadors can update own gallery images" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Ambassadors can delete own gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view ambassador content" ON storage.objects FOR SELECT TO public USING (bucket_id = 'ambassador-content');
CREATE POLICY "Ambassadors can upload own content" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ambassador-content' AND (storage.foldername(name))[1] = (auth.uid())::text AND has_role(auth.uid(), 'ambassador'::app_role));
CREATE POLICY "Ambassadors can update own content" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'ambassador-content' AND (storage.foldername(name))[1] = (auth.uid())::text AND has_role(auth.uid(), 'ambassador'::app_role));
CREATE POLICY "Ambassadors can delete own content" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ambassador-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- PART 13: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_appointments_ambassador_id ON public.appointments(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_shares_ambassador_id ON public.shares(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_shares_content_id ON public.shares(content_id);
CREATE INDEX IF NOT EXISTS idx_funnel_metrics_date ON public.funnel_metrics(date);
CREATE INDEX IF NOT EXISTS idx_funnel_metrics_ambassador_id ON public.funnel_metrics(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON public.leads(updated_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_funnel_gallery_images_funnel_id ON public.funnel_gallery_images(funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_gallery_images_sort_order ON public.funnel_gallery_images(funnel_id, sort_order);

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================

