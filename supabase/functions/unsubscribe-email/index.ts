// Supabase Edge Function for handling email unsubscribes
// Deploy with: supabase functions deploy unsubscribe-email --project-ref jecmbjynrtwdetwkghgt

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get email from request body or query param
    let email: string | null = null;
    
    if (req.method === "POST") {
      const body = await req.json();
      email = body.email;
    } else if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("token");
      if (token) {
        try {
          email = atob(token);
        } catch {
          throw new Error("Invalid unsubscribe token");
        }
      }
    }

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Processing unsubscribe for: ${email}`);

    // Update subscription status
    const { error: subError } = await supabase
      .from("email_subscriptions")
      .update({ 
        status: "unsubscribed", 
        unsubscribed_at: new Date().toISOString() 
      })
      .eq("email", email);

    if (subError) {
      console.error("Error updating subscription:", subError);
    }

    // Update all active enrollments
    const { data: subscription } = await supabase
      .from("email_subscriptions")
      .select("id")
      .eq("email", email)
      .single();

    if (subscription) {
      await supabase
        .from("email_sequence_enrollments")
        .update({ status: "unsubscribed" })
        .eq("subscription_id", subscription.id)
        .eq("status", "active");

      // Cancel all pending emails
      await supabase
        .from("email_queue")
        .update({ status: "cancelled" })
        .eq("subscription_id", subscription.id)
        .eq("status", "pending");
    }

    console.log(`Successfully unsubscribed: ${email}`);

    // Return HTML page for GET requests (when user clicks link)
    if (req.method === "GET") {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribed - MWR Travel</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background: #0077B6;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            }
            .button:hover {
              background: #005f8f;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>You're Unsubscribed</h1>
            <p>We've removed <strong>${email}</strong> from our email list.</p>
            <p>We're sorry to see you go! If you change your mind, you're always welcome back.</p>
            <a href="https://iluvmytravelclub.com" class="button">Visit Our Website</a>
          </div>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      });
    }

    // Return JSON for POST requests
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully unsubscribed ${email}` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unsubscribe error:", error);
    
    // Return error HTML for GET requests
    if (req.method === "GET") {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error - MWR Travel</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Something Went Wrong</h1>
            <p>${error.message}</p>
            <p>Please contact support if you continue to have issues.</p>
          </div>
        </body>
        </html>
      `;
      return new Response(html, {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      });
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

