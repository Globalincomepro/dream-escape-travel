import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing scheduled posts...');

    // Get posts that are due
    const { data: duePosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error('Error fetching due posts:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${duePosts?.length || 0} due posts`);

    let processed = 0;
    let failed = 0;

    for (const post of duePosts || []) {
      try {
        // Update status to processing
        await supabase
          .from('scheduled_posts')
          .update({ status: 'processing' })
          .eq('id', post.id);

        // Fetch profile separately
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', post.ambassador_id)
          .single();

        // Fetch funnel separately
        const { data: funnel } = await supabase
          .from('ambassador_funnels')
          .select('funnel_slug')
          .eq('user_id', post.ambassador_id)
          .single();

        // Get funnel slug
        const funnelSlug = funnel?.funnel_slug || 'default';
        const funnelLink = `https://lsstnraurqcskhhduldy.lovable.app/f/${funnelSlug}?ref=social&post_id=${post.id}`;

        // Build caption with funnel link
        let caption = post.custom_caption || '';
        if (!caption.includes('http')) {
          caption += `\n\n🌍 Book your dream vacation: ${funnelLink}`;
        }

        // Get image URL from the scheduled post's content fields
        const imageUrl = post.content_file_url || post.content_thumbnail_url || '';
        const ambassadorName = profile?.full_name || 'Ambassador';

        // Prepare payload for Zapier
        const payload = {
          caption,
          image_url: imageUrl,
          platforms: post.platforms,
          ambassador_name: ambassadorName,
          post_id: post.id,
          funnel_link: funnelLink
        };

        console.log(`Sending post ${post.id} to Zapier webhook`);

        // Send to Zapier webhook
        const zapierResponse = await fetch(post.zapier_webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!zapierResponse.ok) {
          throw new Error(`Zapier webhook failed: ${zapierResponse.status}`);
        }

        // Update status to posted
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString()
          })
          .eq('id', post.id);

        // Create analytics records for each platform
        for (const platform of post.platforms) {
          await supabase
            .from('social_post_analytics')
            .insert({
              scheduled_post_id: post.id,
              ambassador_id: post.ambassador_id,
              platform,
              clicks: 0,
              conversions: 0
            });
        }

        processed++;
        console.log(`Successfully posted ${post.id}`);
      } catch (error) {
        console.error(`Failed to process post ${post.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Update status to failed with error message
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: errorMessage
          })
          .eq('id', post.id);

        failed++;
      }
    }

    const result = {
      success: true,
      processed,
      failed,
      total: duePosts?.length || 0
    };

    console.log('Processing complete:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in process-scheduled-posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
