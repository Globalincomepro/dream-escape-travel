import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a placeholder client if env vars are not set (for development)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(url, key)

// Database types
export interface Lead {
  id?: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  lead_score: number
  lead_status: 'cold' | 'warm' | 'hot'
  source: string
  quiz_result?: string
  created_at?: string
}

export interface QuizSubmission {
  id?: string
  lead_id: string
  answers: Record<string, string>
  result_type: string
  created_at?: string
}

export interface LeadActivity {
  id?: string
  lead_id?: string
  session_id: string
  page_viewed: string
  action: string
  metadata?: Record<string, unknown>
  created_at?: string
}

// Lead operations
export async function createLead(lead: Omit<Lead, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating lead:', error)
    throw error
  }
  
  return data
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating lead:', error)
    throw error
  }
  
  return data
}

export async function getLeadByEmail(email: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching lead:', error)
    throw error
  }
  
  return data
}

// Quiz operations
export async function saveQuizSubmission(submission: Omit<QuizSubmission, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('quiz_submissions')
    .insert([submission])
    .select()
    .single()
  
  if (error) {
    console.error('Error saving quiz submission:', error)
    throw error
  }
  
  return data
}

// Activity tracking
export async function trackActivity(activity: Omit<LeadActivity, 'id' | 'created_at'>) {
  const { error } = await supabase
    .from('lead_activity')
    .insert([activity])
  
  if (error) {
    console.error('Error tracking activity:', error)
  }
}

// Real-time subscriptions for social proof
export function subscribeToNewLeads(callback: (lead: Lead) => void) {
  return supabase
    .channel('new-leads')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'leads' },
      (payload) => {
        callback(payload.new as Lead)
      }
    )
    .subscribe()
}

// Get recent leads count for social proof
export async function getRecentLeadsCount(hours: number = 24) {
  const since = new Date()
  since.setHours(since.getHours() - hours)
  
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since.toISOString())
  
  if (error) {
    console.error('Error getting recent leads count:', error)
    return 0
  }
  
  return count || 0
}

