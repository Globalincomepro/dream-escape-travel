// Email sending functions - these would typically be called from a server/edge function
// For client-side, we'll use Supabase Edge Functions to send emails via Resend

import { supabase } from './supabase'

export interface EmailData {
  to: string
  firstName: string
  templateType: 'welcome' | 'quiz_result' | 'calculator_result' | 'follow_up'
  data?: Record<string, unknown>
}

export async function sendEmail(emailData: EmailData) {
  // Call Supabase Edge Function to send email via Resend
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: emailData,
  })
  
  if (error) {
    console.error('Error sending email:', error)
    throw error
  }
  
  return data
}

// Email templates content (used by edge function)
export const emailTemplates = {
  welcome: {
    subject: "🌴 Welcome! Your Exclusive Travel Video Is Ready",
    getContent: (firstName: string) => `
      <h1>Welcome, ${firstName}!</h1>
      <p>We're so excited you've taken the first step toward transforming how you travel.</p>
      <p>As promised, here's your exclusive access to our video that reveals exactly how we went from one vacation every few years to traveling the world regularly.</p>
      <p><a href="{{VIDEO_LINK}}" style="background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Watch Your Exclusive Video</a></p>
      <p>In this video, you'll discover:</p>
      <ul>
        <li>The exact travel membership we use</li>
        <li>How we book $500/night resorts for under $150</li>
        <li>The simple system that lets us travel 4-5 times per year</li>
      </ul>
      <p>To your next adventure,<br/>Donna & Charles Potter</p>
    `,
  },
  quiz_result: {
    subject: "🎯 Your Travel Personality Results Are In!",
    getContent: (firstName: string, resultType: string) => `
      <h1>${firstName}, You're a ${resultType}!</h1>
      <p>Based on your quiz answers, we've identified your unique travel personality.</p>
      <p>This means you'll love destinations with [personality-specific content].</p>
      <p>The great news? Our travel membership has incredible deals perfect for ${resultType}s like you.</p>
      <p><a href="{{VIDEO_LINK}}" style="background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">See How Much You Could Save</a></p>
    `,
  },
  calculator_result: {
    subject: "💰 Your Travel Savings Report",
    getContent: (firstName: string, savings: number) => `
      <h1>${firstName}, You Could Save $${savings.toLocaleString()}/Year!</h1>
      <p>Based on your current travel spending, our travel membership could help you save significantly - or travel more for the same budget.</p>
      <p>Imagine what you could do with those savings:</p>
      <ul>
        <li>An extra vacation each year</li>
        <li>Upgrade to luxury resorts</li>
        <li>Bring your whole family</li>
      </ul>
      <p><a href="{{VIDEO_LINK}}" style="background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Learn How It Works</a></p>
    `,
  },
  follow_up: {
    subject: "Still dreaming of your next adventure? 🌎",
    getContent: (firstName: string) => `
      <h1>Hi ${firstName},</h1>
      <p>We noticed you were interested in learning about wholesale travel pricing but haven't had a chance to watch our full video yet.</p>
      <p>We get it - life gets busy! But we don't want you to miss out on this opportunity.</p>
      <p>Here's the thing: we were just like you. Dreaming about travel but thinking it was out of reach.</p>
      <p>Then we discovered this system, and everything changed.</p>
      <p><a href="{{VIDEO_LINK}}" style="background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Watch Now (It's Free)</a></p>
      <p>Your next adventure is closer than you think.</p>
      <p>Donna & Charles</p>
    `,
  },
}

