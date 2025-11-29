-- Phase 1: Database Schema Extensions (Fixed)

-- 1. Create the missing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Extend profiles table with region
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS region TEXT;

-- 3. Extend leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update leads status to include new values
ALTER TABLE public.leads
DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE public.leads
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('prospect', 'new', 'interested', 'booked', 'no_show', 'enrolled', 'closed', 'contacted', 'converted'));

-- 4. Extend content_library with caption template
ALTER TABLE public.content_library
ADD COLUMN IF NOT EXISTS caption_template TEXT;

-- 5. Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'canceled', 'no_show')),
  google_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all appointments"
ON public.appointments FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Ambassadors can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = ambassador_id);

CREATE POLICY "Ambassadors can create own appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = ambassador_id);

CREATE POLICY "Ambassadors can update own appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = ambassador_id);

-- 6. Create shares table
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE NOT NULL,
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('facebook', 'instagram', 'tiktok', 'linkedin', 'x', 'email', 'sms')),
  referral_link TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all shares"
ON public.shares FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Ambassadors can view own shares"
ON public.shares FOR SELECT
USING (auth.uid() = ambassador_id);

CREATE POLICY "Ambassadors can create own shares"
ON public.shares FOR INSERT
WITH CHECK (auth.uid() = ambassador_id);

CREATE POLICY "Anyone can update share metrics"
ON public.shares FOR UPDATE
USING (true) WITH CHECK (true);

-- 7. Create funnel_metrics table
CREATE TABLE IF NOT EXISTS public.funnel_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  enrollments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, ambassador_id)
);

ALTER TABLE public.funnel_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all metrics"
ON public.funnel_metrics FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Ambassadors can view own metrics"
ON public.funnel_metrics FOR SELECT
USING (auth.uid() = ambassador_id OR ambassador_id IS NULL);

-- 8. Create ambassador_calendars table
CREATE TABLE IF NOT EXISTS public.ambassador_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calendar_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ambassador_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can manage own calendar"
ON public.ambassador_calendars FOR ALL
USING (auth.uid() = ambassador_id)
WITH CHECK (auth.uid() = ambassador_id);

-- 9. Create triggers
CREATE TRIGGER update_leads_updated_at_trigger
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_calendars_updated_at_trigger
BEFORE UPDATE ON public.ambassador_calendars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Add system settings
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES 
  ('routing_mode', '{"type":"round_robin","default_ambassador_id":null}'::jsonb),
  ('lead_alerts', '{"escalate_after_hours":24,"reminder_after_hours":48}'::jsonb),
  ('calendar_settings', '{"timezone":"America/Chicago","default_duration_minutes":30,"buffer_minutes":15,"business_hours_start":"09:00","business_hours_end":"18:00"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- 11. Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_ambassador_id ON public.appointments(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_shares_ambassador_id ON public.shares(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_shares_content_id ON public.shares(content_id);
CREATE INDEX IF NOT EXISTS idx_funnel_metrics_date ON public.funnel_metrics(date);
CREATE INDEX IF NOT EXISTS idx_funnel_metrics_ambassador_id ON public.funnel_metrics(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON public.leads(updated_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);