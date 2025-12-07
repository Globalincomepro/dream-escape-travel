import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  preferredContactTime: string;
  intent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, preferredContactTime, intent }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email, "with intent:", intent);

    const isJoinNow = intent === 'join_now';
    const subject = isJoinNow 
      ? "Welcome to MWR Life! Here's What Happens Next 🎉"
      : "Your Questions About MWR Travel - Let's Talk!";

    const html = isJoinNow ? `
        <!DOCTYPE html>
        <html>
          <head></head>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; margin-bottom: 10px;">Exciting! You're About to Unlock Wholesale Travel Pricing 🎉</h1>
              
              <h2 style="color: #333;">Hi ${name}!</h2>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                Welcome to the MWR Life family! You're taking the first step toward traveling the world at prices others only dream of.
              </p>

              <div style="text-align: center; background: #4CAF50; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: white;">Complete Your Registration:</h3>
                <a href="https://www.mwrlife.com/gocpotter" style="background: white; color: #4CAF50; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 10px;">
                  Join MWR Life Now →
                </a>
              </div>

              <h3>Here's What Happens Next:</h3>
              
              <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; border-radius: 4px;">
                <strong>✅ Step 1:</strong> Complete your MWR Life registration using the button above
              </div>
              
              <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; border-radius: 4px;">
                <strong>📧 Step 2:</strong> Watch for additional onboarding emails with your member resources
              </div>
              
              <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; border-radius: 4px;">
                <strong>📞 Step 3:</strong> We'll personally reach out within 24 hours to help you get started
              </div>
              
              <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; border-radius: 4px;">
                <strong>✈️ Step 4:</strong> Start planning your first trip at wholesale prices!
              </div>

              <p style="margin-top: 30px;"><strong>Questions?</strong> Just reply to this email - we're here to help!</p>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                <p style="margin: 5px 0; color: #666;">Talk soon,</p>
                <p style="margin: 5px 0; color: #333; font-weight: bold;">Donna & Charles Potter</p>
                <p style="margin: 5px 0; color: #999; font-size: 14px;">Your MWR Life Ambassadors</p>
                <p style="color: #666; font-size: 12px;">Preferred contact time: ${preferredContactTime}</p>
              </div>
            </div>
          </body>
        </html>
    ` : `
        <!DOCTYPE html>
        <html>
          <head></head>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; margin-bottom: 10px;">Thanks for Your Interest! Let's Answer Your Questions 💬</h1>
              
              <h2 style="color: #333;">Hi ${name}!</h2>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                We know choosing a travel program is a big decision - that's smart! We're here to answer every question and help you make the best choice.
              </p>

              <div style="background: #FF9800; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: white;">We'll Call You Within 24 Hours</h3>
                <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">Preferred Time: ${preferredContactTime}</p>
                <p style="margin-bottom: 0;">Get ready to have all your questions answered by someone who knows MWR Life inside and out!</p>
              </div>

              <h3>Common Questions We'll Answer:</h3>
              
              <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #FF9800; border-radius: 4px;">
                <strong>💰 How much can I really save?</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Our members save 30-60% on luxury accommodations, cruises, and vacation packages.</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #FF9800; border-radius: 4px;">
                <strong>🌍 What destinations are included?</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Over 1 million properties in 200+ countries - from beach resorts to mountain getaways.</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #FF9800; border-radius: 4px;">
                <strong>💳 Is there a membership fee?</strong>
                <p style="margin: 5px 0 0 0; color: #666;">We'll explain all membership options and which one fits your travel style best.</p>
              </div>
              
              <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #FF9800; border-radius: 4px;">
                <strong>💼 Can I earn income sharing this?</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Yes! Many members share MWR Life and earn income. We'll show you exactly how.</p>
              </div>

              <p style="margin-top: 30px;"><strong>Have more questions?</strong> Write them down and we'll cover them all during our call!</p>
              
              <p style="background: #FFF3E0; padding: 15px; border-radius: 6px; border-left: 4px solid #FF9800;">
                <strong>💡 Pro Tip:</strong> While you wait, think about your dream destination. We'll show you how much you could save on your next trip there!
              </p>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                <p style="margin: 5px 0; color: #666;">Talk soon,</p>
                <p style="margin: 5px 0; color: #333; font-weight: bold;">Donna & Charles Potter</p>
                <p style="margin: 5px 0; color: #999; font-size: 14px;">Your MWR Life Ambassadors</p>
                <p style="color: #666; font-size: 12px;">Questions before our call? Just reply to this email!</p>
              </div>
            </div>
          </body>
        </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Donna & Charles <DonnaCharles@iluvmytravelclub.com>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
