-- MWR Dream Escape Travel - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads Table - Store all captured leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_status VARCHAR(20) DEFAULT 'cold' CHECK (lead_status IN ('cold', 'warm', 'hot')),
  source VARCHAR(50) NOT NULL,
  quiz_result VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Submissions Table - Store quiz answers and results
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  result_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Activity Table - Track user behavior for lead scoring
CREATE TABLE IF NOT EXISTS lead_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  page_viewed VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table - Store AI chat conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculator Sessions Table - Track savings calculator usage
CREATE TABLE IF NOT EXISTS calculator_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  input_data JSONB NOT NULL,
  calculated_savings DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Log Table - Track sent emails
CREATE TABLE IF NOT EXISTS email_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent',
  resend_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_activity_session ON lead_activity(session_id);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON lead_activity(lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_lead ON quiz_submissions(lead_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert for lead capture (public forms)
CREATE POLICY "Allow anonymous lead creation" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous quiz submission" ON quiz_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous activity tracking" ON lead_activity
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous chat messages" ON chat_messages
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous calculator sessions" ON calculator_sessions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow service role full access (for admin/backend operations)
CREATE POLICY "Service role full access to leads" ON leads
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to quiz_submissions" ON quiz_submissions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to lead_activity" ON lead_activity
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to chat_messages" ON chat_messages
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to calculator_sessions" ON calculator_sessions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to email_log" ON email_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable realtime for leads table (for social proof notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- Sample view for dashboard statistics
CREATE OR REPLACE VIEW lead_statistics AS
SELECT
  COUNT(*) as total_leads,
  COUNT(CASE WHEN lead_status = 'hot' THEN 1 END) as hot_leads,
  COUNT(CASE WHEN lead_status = 'warm' THEN 1 END) as warm_leads,
  COUNT(CASE WHEN lead_status = 'cold' THEN 1 END) as cold_leads,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as leads_today,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as leads_this_week,
  AVG(lead_score)::DECIMAL(5,2) as avg_lead_score
FROM leads;

