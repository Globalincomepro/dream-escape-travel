// Supabase Edge Function for sending emails via Resend
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'Donna & Charles <hello@yourdomain.com>' // Update with your verified domain

interface EmailRequest {
  to: string
  firstName: string
  templateType: 'welcome' | 'quiz_result' | 'calculator_result' | 'follow_up' | 'admin_notification'
  data?: Record<string, unknown>
}

const emailTemplates = {
  welcome: (firstName: string) => ({
    subject: '🌴 Welcome! Your Exclusive Travel Video Is Ready',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077B6, #00A8E8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .cta-button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome, ${firstName}! 🎉</h1>
          </div>
          <div class="content">
            <p>We're so excited you've taken the first step toward transforming how you travel.</p>
            
            <p>As promised, here's your exclusive access to our video that reveals exactly how we went from one vacation every few years to traveling the world regularly.</p>
            
            <p style="text-align: center;">
              <a href="YOUR_VIDEO_LINK_HERE" class="cta-button">🎬 Watch Your Exclusive Video</a>
            </p>
            
            <p><strong>In this video, you'll discover:</strong></p>
            <ul>
              <li>✓ The exact travel membership we use</li>
              <li>✓ How we book $500/night resorts for under $150</li>
              <li>✓ The simple system that lets us travel 4-5 times per year</li>
              <li>✓ How you can potentially earn income while exploring the world</li>
            </ul>
            
            <p>To your next adventure,<br/>
            <strong>Donna & Charles Potter</strong></p>
          </div>
          <div class="footer">
            <p>You received this email because you signed up at Dream Escape Travel.</p>
            <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  quiz_result: (firstName: string, data?: Record<string, unknown>) => ({
    subject: `🎯 ${firstName}, Your Travel Personality Results Are In!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077B6, #00A8E8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .result-badge { background: #D4AF37; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .content { background: #f9f9f9; padding: 30px; }
          .cta-button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${firstName}, You're a</h1>
            <span class="result-badge">${data?.resultType || 'Travel Enthusiast'}</span>
          </div>
          <div class="content">
            <p>Based on your quiz answers, we've identified your unique travel personality!</p>
            
            <p>This means you'll love destinations with beautiful scenery, great experiences, and unforgettable moments.</p>
            
            <p><strong>The great news?</strong> Our travel membership has incredible deals perfect for travelers like you.</p>
            
            <p style="text-align: center;">
              <a href="YOUR_VIDEO_LINK_HERE" class="cta-button">See How Much You Could Save</a>
            </p>
            
            <p>Happy travels!<br/>
            <strong>Donna & Charles</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  calculator_result: (firstName: string, data?: Record<string, unknown>) => ({
    subject: `💰 ${firstName}, Your Travel Savings Report`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37, #F4E4A6); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .savings-amount { font-size: 48px; font-weight: bold; color: #0077B6; }
          .content { background: #f9f9f9; padding: 30px; }
          .cta-button { display: inline-block; background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Potential Savings</h1>
            <div class="savings-amount">$${data?.savings || '3,500'}/year</div>
          </div>
          <div class="content">
            <p>Hi ${firstName}!</p>
            
            <p>Based on your current travel spending, our travel membership could help you save significantly - or travel more for the same budget.</p>
            
            <p><strong>Imagine what you could do with those savings:</strong></p>
            <ul>
              <li>✈️ An extra vacation each year</li>
              <li>🏨 Upgrade to luxury resorts</li>
              <li>👨‍👩‍👧‍👦 Bring your whole family</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="YOUR_VIDEO_LINK_HERE" class="cta-button">Learn How It Works</a>
            </p>
            
            <p>To amazing savings,<br/>
            <strong>Donna & Charles</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  admin_notification: (_firstName: string, data?: Record<string, unknown>) => ({
    subject: `🔔 New Lead: ${data?.leadName} (${data?.source})`,
    html: `
      <h2>New Lead Alert!</h2>
      <p><strong>Name:</strong> ${data?.leadName}</p>
      <p><strong>Email:</strong> ${data?.leadEmail}</p>
      <p><strong>Source:</strong> ${data?.source}</p>
      <p><strong>Lead Score:</strong> ${data?.leadScore}</p>
      <p><strong>Quiz Result:</strong> ${data?.quizResult || 'N/A'}</p>
      <hr/>
      <p><a href="YOUR_SUPABASE_DASHBOARD_URL">View in Dashboard</a></p>
    `,
  }),

  follow_up: (firstName: string) => ({
    subject: `Still dreaming of your next adventure, ${firstName}? 🌎`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Hi ${firstName},</h1>
        
        <p>We noticed you were interested in learning about wholesale travel pricing but haven't had a chance to watch our full video yet.</p>
        
        <p>We get it - life gets busy! But we don't want you to miss out on this opportunity.</p>
        
        <p>Here's the thing: we were just like you. Dreaming about travel but thinking luxury vacations were out of reach.</p>
        
        <p>Then we discovered this system, and everything changed.</p>
        
        <p style="text-align: center;">
          <a href="YOUR_VIDEO_LINK_HERE" style="display: inline-block; background: #0077B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Watch Now (It's Free)</a>
        </p>
        
        <p>Your next adventure is closer than you think.</p>
        
        <p>Donna & Charles</p>
      </body>
      </html>
    `,
  }),
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { to, firstName, templateType, data } = await req.json() as EmailRequest

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const template = emailTemplates[templateType]
    if (!template) {
      throw new Error(`Unknown template type: ${templateType}`)
    }

    const { subject, html } = template(firstName, data)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Email error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})

