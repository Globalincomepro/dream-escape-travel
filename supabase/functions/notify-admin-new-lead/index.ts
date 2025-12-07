import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyAdminRequest {
  lead: {
    full_name: string;
    email: string;
    phone: string;
    preferred_contact_time: string;
    source: string;
    funnel_slug?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    intent?: string;
    created_at: string;
  };
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead, adminEmail }: NotifyAdminRequest = await req.json();

    console.log("Sending admin notification for lead:", lead.email);

    const subject = lead.intent === 'join_now' 
      ? `🔥 NEW LEAD - Ready to Join: ${lead.full_name}`
      : lead.intent === 'need_info'
      ? `📞 NEW LEAD - Needs Follow-up: ${lead.full_name}`
      : `🚨 New Lead from Webinar: ${lead.full_name}`;

    const emailResponse = await resend.emails.send({
      from: "MWR Travel Leads <DonnaCharles@iluvmytravelclub.com>",
      to: [adminEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Lead from Webinar!</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #666;">Contact Details</h3>
            <p style="margin: 10px 0;"><strong>Name:</strong> ${lead.full_name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
            <p style="margin: 10px 0;"><strong>Phone:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></p>
            <p style="margin: 10px 0;"><strong>Best Time to Call:</strong> <span style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;">${lead.preferred_contact_time}</span></p>
            ${lead.intent ? `
            <p style="margin: 10px 0;">
              <strong>Intent:</strong> 
              <span style="background: ${lead.intent === 'join_now' ? '#4CAF50' : '#FF9800'}; 
                           color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                ${lead.intent === 'join_now' ? '✅ Ready to Join' : '❓ Needs More Info'}
              </span>
            </p>
            ` : ''}
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #666;">Source Information</h3>
            <p style="margin: 10px 0;"><strong>Source:</strong> ${lead.source}</p>
            ${lead.funnel_slug ? `<p style="margin: 10px 0;"><strong>Funnel:</strong> ${lead.funnel_slug}</p>` : ''}
            ${lead.utm_source ? `<p style="margin: 10px 0;"><strong>UTM Source:</strong> ${lead.utm_source}</p>` : ''}
            ${lead.utm_medium ? `<p style="margin: 10px 0;"><strong>UTM Medium:</strong> ${lead.utm_medium}</p>` : ''}
            ${lead.utm_campaign ? `<p style="margin: 10px 0;"><strong>UTM Campaign:</strong> ${lead.utm_campaign}</p>` : ''}
            <p style="margin: 10px 0;"><strong>Submitted:</strong> ${new Date(lead.created_at).toLocaleString()}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">View all leads in your dashboard</p>
          </div>
        </div>
      `,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-admin-new-lead function:", error);
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
