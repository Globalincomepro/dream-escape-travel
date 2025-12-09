-- Email Campaigns System
-- Migration to add email sequences, templates, and automation

-- =====================================================
-- 1. EMAIL SEQUENCES TABLE
-- Defines email sequences (e.g., "Prospect Nurture", "Ambassador Onboarding")
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sequence_type TEXT NOT NULL CHECK (sequence_type IN ('prospect', 'ambassador', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. EMAIL TEMPLATES TABLE
-- Stores individual email templates within sequences
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0, -- Days after sequence start to send
  step_order INTEGER NOT NULL DEFAULT 1, -- Order within sequence
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. EMAIL SUBSCRIPTIONS TABLE
-- Tracks subscription status for each contact
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. EMAIL SEQUENCE ENROLLMENTS TABLE
-- Tracks which contacts are enrolled in which sequences
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.email_subscriptions(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'converted', 'unsubscribed', 'paused')),
  current_step INTEGER DEFAULT 1,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, sequence_id)
);

-- =====================================================
-- 5. EMAIL QUEUE TABLE
-- Queue of emails to be sent
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.email_subscriptions(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES public.email_sequence_enrollments(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. EMAIL LOGS TABLE
-- History of all sent emails
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.email_subscriptions(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  email_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  resend_id TEXT, -- ID from Resend API
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON public.email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON public.email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON public.email_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_enrollments_status ON public.email_sequence_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_subscription ON public.email_logs(subscription_id);

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_sequences_updated_at ON public.email_sequences;
CREATE TRIGGER update_email_sequences_updated_at
  BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON public.email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at
  BEFORE UPDATE ON public.email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS update_email_enrollments_updated_at ON public.email_sequence_enrollments;
CREATE TRIGGER update_email_enrollments_updated_at
  BEFORE UPDATE ON public.email_sequence_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage email_sequences" ON public.email_sequences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage email_templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage email_subscriptions" ON public.email_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage email_enrollments" ON public.email_sequence_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage email_queue" ON public.email_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can view email_logs" ON public.email_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Ambassadors can view email logs for their own leads
CREATE POLICY "Ambassadors can view their leads email_logs" ON public.email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads l 
      WHERE l.ambassador_id = auth.uid() 
      AND l.email = email_logs.email_to
    )
  );

-- Service role bypass for Edge Functions
CREATE POLICY "Service role can manage all email tables" ON public.email_sequences
  FOR ALL USING (auth.role() = 'service_role');
  
CREATE POLICY "Service role can manage email_templates" ON public.email_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email_subscriptions" ON public.email_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email_enrollments" ON public.email_sequence_enrollments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email_queue" ON public.email_queue
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email_logs" ON public.email_logs
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- FUNCTION: Enroll new lead in prospect sequence
-- Called automatically when a new lead is created
-- =====================================================
CREATE OR REPLACE FUNCTION public.enroll_lead_in_email_sequence()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_id UUID;
  v_sequence_id UUID;
  v_template RECORD;
BEGIN
  -- Create or get email subscription
  INSERT INTO public.email_subscriptions (email, first_name, lead_id)
  VALUES (NEW.email, NEW.full_name, NEW.id)
  ON CONFLICT (email) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, email_subscriptions.first_name),
    lead_id = COALESCE(EXCLUDED.lead_id, email_subscriptions.lead_id),
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;

  -- Get active prospect sequence
  SELECT id INTO v_sequence_id
  FROM public.email_sequences
  WHERE sequence_type = 'prospect' AND is_active = true
  LIMIT 1;

  -- If we have a sequence, enroll the lead
  IF v_sequence_id IS NOT NULL THEN
    -- Create enrollment
    INSERT INTO public.email_sequence_enrollments (subscription_id, sequence_id, status)
    VALUES (v_subscription_id, v_sequence_id, 'active')
    ON CONFLICT (subscription_id, sequence_id) DO NOTHING;

    -- Queue all emails in the sequence
    FOR v_template IN 
      SELECT id, delay_days, step_order 
      FROM public.email_templates 
      WHERE sequence_id = v_sequence_id AND is_active = true
      ORDER BY step_order
    LOOP
      INSERT INTO public.email_queue (subscription_id, template_id, enrollment_id, scheduled_for)
      SELECT 
        v_subscription_id,
        v_template.id,
        e.id,
        NOW() + (v_template.delay_days || ' days')::INTERVAL
      FROM public.email_sequence_enrollments e
      WHERE e.subscription_id = v_subscription_id AND e.sequence_id = v_sequence_id
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on leads table
DROP TRIGGER IF EXISTS enroll_lead_email_sequence ON public.leads;
CREATE TRIGGER enroll_lead_email_sequence
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.enroll_lead_in_email_sequence();

-- =====================================================
-- FUNCTION: Check for ambassador conversion
-- Stops prospect sequence and starts ambassador sequence
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_ambassador_conversion()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_id UUID;
  v_ambassador_sequence_id UUID;
  v_template RECORD;
BEGIN
  -- Only trigger when role is 'ambassador'
  IF NEW.role = 'ambassador' THEN
    -- Get the user's email
    DECLARE v_user_email TEXT;
    BEGIN
      SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.user_id;
      
      IF v_user_email IS NOT NULL THEN
        -- Get subscription
        SELECT id INTO v_subscription_id
        FROM public.email_subscriptions
        WHERE email = v_user_email;
        
        IF v_subscription_id IS NOT NULL THEN
          -- Mark all active enrollments as converted
          UPDATE public.email_sequence_enrollments
          SET status = 'converted', converted_at = NOW()
          WHERE subscription_id = v_subscription_id AND status = 'active';
          
          -- Cancel pending emails
          UPDATE public.email_queue
          SET status = 'cancelled'
          WHERE subscription_id = v_subscription_id AND status = 'pending';
          
          -- Get active ambassador sequence
          SELECT id INTO v_ambassador_sequence_id
          FROM public.email_sequences
          WHERE sequence_type = 'ambassador' AND is_active = true
          LIMIT 1;
          
          -- Enroll in ambassador sequence
          IF v_ambassador_sequence_id IS NOT NULL THEN
            INSERT INTO public.email_sequence_enrollments (subscription_id, sequence_id, status)
            VALUES (v_subscription_id, v_ambassador_sequence_id, 'active')
            ON CONFLICT (subscription_id, sequence_id) DO NOTHING;
            
            -- Queue ambassador emails
            FOR v_template IN 
              SELECT id, delay_days, step_order 
              FROM public.email_templates 
              WHERE sequence_id = v_ambassador_sequence_id AND is_active = true
              ORDER BY step_order
            LOOP
              INSERT INTO public.email_queue (subscription_id, template_id, enrollment_id, scheduled_for)
              SELECT 
                v_subscription_id,
                v_template.id,
                e.id,
                NOW() + (v_template.delay_days || ' days')::INTERVAL
              FROM public.email_sequence_enrollments e
              WHERE e.subscription_id = v_subscription_id AND e.sequence_id = v_ambassador_sequence_id
              ON CONFLICT DO NOTHING;
            END LOOP;
          END IF;
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_roles table
DROP TRIGGER IF EXISTS check_ambassador_conversion_trigger ON public.user_roles;
CREATE TRIGGER check_ambassador_conversion_trigger
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.check_ambassador_conversion();

-- =====================================================
-- FUNCTION: Handle unsubscribe
-- =====================================================
CREATE OR REPLACE FUNCTION public.unsubscribe_email(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update subscription status
  UPDATE public.email_subscriptions
  SET status = 'unsubscribed', unsubscribed_at = NOW()
  WHERE email = p_email;
  
  -- Update all enrollments
  UPDATE public.email_sequence_enrollments
  SET status = 'unsubscribed'
  WHERE subscription_id IN (
    SELECT id FROM public.email_subscriptions WHERE email = p_email
  ) AND status = 'active';
  
  -- Cancel pending emails
  UPDATE public.email_queue
  SET status = 'cancelled'
  WHERE subscription_id IN (
    SELECT id FROM public.email_subscriptions WHERE email = p_email
  ) AND status = 'pending';
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

