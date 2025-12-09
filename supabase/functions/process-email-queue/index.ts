// Supabase Edge Function for processing email queue
// This function should be called by a cron job every 5-15 minutes
// Deploy with: supabase functions deploy process-email-queue --project-ref jecmbjynrtwdetwkghgt

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Donna & Charles <DonnaCharles@iluvmytravelclub.com>";
const SITE_URL = "https://iluvmytravelclub.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueuedEmail {
  id: string;
  subscription_id: string;
  template_id: string;
  enrollment_id: string;
  scheduled_for: string;
  subscription: {
    id: string;
    email: string;
    first_name: string;
    status: string;
  };
  template: {
    id: string;
    subject: string;
    html_content: string;
    name: string;
  };
}

// Replace template variables
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

// Generate unsubscribe link
function getUnsubscribeLink(email: string): string {
  const encoded = btoa(email);
  return `${SITE_URL}/unsubscribe?token=${encoded}`;
}

// Add footer to email
function addEmailFooter(html: string, email: string): string {
  const unsubscribeLink = getUnsubscribeLink(email);
  const footer = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
      <p>You're receiving this because you signed up at iluvmytravelclub.com</p>
      <p>MWR Travel</p>
      <p>
        <a href="${unsubscribeLink}" style="color: #666;">Unsubscribe</a> | 
        <a href="${SITE_URL}/privacy" style="color: #666;">Privacy Policy</a>
      </p>
    </div>
  `;
  
  // Insert footer before closing body tag
  if (html.includes("</body>")) {
    return html.replace("</body>", `${footer}</body>`);
  }
  return html + footer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Processing email queue...");

    // Get pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select(`
        id,
        subscription_id,
        template_id,
        enrollment_id,
        scheduled_for,
        subscription:email_subscriptions!subscription_id (
          id,
          email,
          first_name,
          status
        ),
        template:email_templates!template_id (
          id,
          subject,
          html_content,
          name
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error("Error fetching queue:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingEmails?.length || 0} emails to process`);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const email of (pendingEmails as QueuedEmail[]) || []) {
      try {
        // Check if subscription is still active
        if (email.subscription?.status !== "active") {
          console.log(`Skipping ${email.id} - subscription not active`);
          await supabase
            .from("email_queue")
            .update({ status: "cancelled" })
            .eq("id", email.id);
          skipped++;
          continue;
        }

        // Check if user became ambassador (double-check)
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", (
            await supabase
              .from("auth.users")
              .select("id")
              .eq("email", email.subscription.email)
              .single()
          ).data?.id)
          .eq("role", "ambassador");

        // If user is now an ambassador and this is a prospect email, skip
        const { data: enrollment } = await supabase
          .from("email_sequence_enrollments")
          .select("sequence:email_sequences!sequence_id(sequence_type)")
          .eq("id", email.enrollment_id)
          .single();

        if (userRoles && userRoles.length > 0 && enrollment?.sequence?.sequence_type === "prospect") {
          console.log(`Skipping ${email.id} - user converted to ambassador`);
          await supabase
            .from("email_queue")
            .update({ status: "cancelled" })
            .eq("id", email.id);
          
          // Also update enrollment
          await supabase
            .from("email_sequence_enrollments")
            .update({ status: "converted", converted_at: new Date().toISOString() })
            .eq("id", email.enrollment_id);
          
          skipped++;
          continue;
        }

        // Mark as processing
        await supabase
          .from("email_queue")
          .update({ status: "processing", attempts: email.attempts + 1 })
          .eq("id", email.id);

        // Prepare email content
        const variables = {
          first_name: email.subscription.first_name || "Friend",
          email: email.subscription.email,
          funnel_slug: "", // Could be fetched if needed
          site_url: SITE_URL,
        };

        const subject = replaceVariables(email.template.subject, variables);
        let htmlContent = replaceVariables(email.template.html_content, variables);
        htmlContent = addEmailFooter(htmlContent, email.subscription.email);

        // Send via Resend
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [email.subscription.email],
            subject: subject,
            html: htmlContent,
          }),
        });

        const resendResult = await resendResponse.json();

        if (!resendResponse.ok) {
          throw new Error(resendResult.message || "Failed to send email");
        }

        // Mark as sent
        await supabase
          .from("email_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", email.id);

        // Log the email
        await supabase.from("email_logs").insert({
          subscription_id: email.subscription_id,
          template_id: email.template_id,
          email_to: email.subscription.email,
          subject: subject,
          status: "sent",
          resend_id: resendResult.id,
        });

        // Update enrollment current step
        await supabase
          .from("email_sequence_enrollments")
          .update({ current_step: email.template.step_order + 1 })
          .eq("id", email.enrollment_id);

        console.log(`Sent email ${email.id} to ${email.subscription.email}`);
        sent++;

      } catch (emailError) {
        console.error(`Failed to send email ${email.id}:`, emailError);
        
        // Mark as failed if too many attempts
        const newStatus = email.attempts >= 2 ? "failed" : "pending";
        await supabase
          .from("email_queue")
          .update({ 
            status: newStatus, 
            last_error: emailError.message,
            // Retry in 1 hour if still pending
            scheduled_for: newStatus === "pending" 
              ? new Date(Date.now() + 60 * 60 * 1000).toISOString() 
              : undefined
          })
          .eq("id", email.id);
        
        failed++;
      }
    }

    // Check for completed sequences
    const { data: completedEnrollments } = await supabase
      .from("email_sequence_enrollments")
      .select(`
        id,
        sequence:email_sequences!sequence_id (
          id,
          email_templates (count)
        )
      `)
      .eq("status", "active");

    for (const enrollment of completedEnrollments || []) {
      const totalSteps = enrollment.sequence?.email_templates?.length || 0;
      
      // Check if all emails for this enrollment are sent
      const { count: pendingCount } = await supabase
        .from("email_queue")
        .select("*", { count: "exact", head: true })
        .eq("enrollment_id", enrollment.id)
        .in("status", ["pending", "processing"]);

      if (pendingCount === 0) {
        await supabase
          .from("email_sequence_enrollments")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", enrollment.id);
      }
    }

    const result = {
      success: true,
      processed: pendingEmails?.length || 0,
      sent,
      skipped,
      failed,
      timestamp: new Date().toISOString(),
    };

    console.log("Email queue processing complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in process-email-queue:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

