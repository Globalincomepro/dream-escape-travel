-- 1. User profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  tagline TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User roles
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

-- 4. Ambassador funnels
CREATE TABLE public.ambassador_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  funnel_slug TEXT UNIQUE NOT NULL,
  hero_image_url TEXT,
  custom_headline TEXT DEFAULT 'Transform Your Travel Dreams Into Reality',
  custom_bio TEXT,
  guest_pass_url TEXT DEFAULT 'https://example.com/guest-pass',
  vip_join_url TEXT DEFAULT 'https://example.com/vip-join',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pending ambassadors
CREATE TABLE public.pending_ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  application_note TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leads tracking
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'prospect',
  source TEXT,
  funnel_slug TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Analytics events
CREATE TABLE public.funnel_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES auth.users(id),
  funnel_id UUID REFERENCES ambassador_funnels(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. System settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default: auto-approve ON
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES ('auto_approve_ambassadors', 'true'::JSONB);

-- 9. Content library
CREATE TABLE public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  caption_text TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Ambassador funnels policies
CREATE POLICY "Anyone can view active funnels"
  ON public.ambassador_funnels FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Ambassadors can create own funnel"
  ON public.ambassador_funnels FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'ambassador'));

CREATE POLICY "Ambassadors can update own funnel"
  ON public.ambassador_funnels FOR UPDATE USING (auth.uid() = user_id);

-- Pending ambassadors policies
CREATE POLICY "Users can view own application"
  ON public.pending_ambassadors FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own application"
  ON public.pending_ambassadors FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage applications"
  ON public.pending_ambassadors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leads policies
CREATE POLICY "Ambassadors view own leads"
  ON public.leads FOR SELECT USING (auth.uid() = ambassador_id);

CREATE POLICY "Admins view all leads"
  ON public.leads FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT WITH CHECK (TRUE);

-- Analytics policies
CREATE POLICY "Ambassadors view own analytics"
  ON public.funnel_analytics FOR SELECT USING (auth.uid() = ambassador_id);

CREATE POLICY "Admins view all analytics"
  ON public.funnel_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert analytics"
  ON public.funnel_analytics FOR INSERT WITH CHECK (TRUE);

-- System settings policies
CREATE POLICY "Everyone can view settings"
  ON public.system_settings FOR SELECT USING (TRUE);

CREATE POLICY "Admins can update settings"
  ON public.system_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Content library policies
CREATE POLICY "Authenticated users view content"
  ON public.content_library FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins manage content"
  ON public.content_library FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
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

-- Promote to ambassador (respects auto-approve setting)
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

-- Admin approve ambassador
CREATE OR REPLACE FUNCTION public.approve_ambassador(_user_id UUID, _admin_id UUID)
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

-- Bulk approve multiple ambassadors
CREATE OR REPLACE FUNCTION public.bulk_approve_ambassadors(_user_ids UUID[], _admin_id UUID)
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
    PERFORM public.approve_ambassador(user_id, _admin_id);
    approved_count := approved_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object('approved_count', approved_count);
END;
$$;

-- Check slug availability
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

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', TRUE),
  ('hero-images', 'hero-images', TRUE),
  ('content-library', 'content-library', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view hero images"
  ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');

CREATE POLICY "Ambassadors upload hero images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hero-images' AND
    public.has_role(auth.uid(), 'ambassador')
  );

CREATE POLICY "Anyone can view content"
  ON storage.objects FOR SELECT USING (bucket_id = 'content-library');

CREATE POLICY "Admins manage content"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'content-library' AND
    public.has_role(auth.uid(), 'admin')
  );