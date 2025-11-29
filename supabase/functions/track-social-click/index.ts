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
    const url = new URL(req.url);
    const postId = url.searchParams.get('post_id');
    const platform = url.searchParams.get('platform');

    if (!postId || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing post_id or platform' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Tracking click for post ${postId} from ${platform}`);

    // Find the analytics record for this post and platform
    const { data: analytics, error: fetchError } = await supabase
      .from('social_post_analytics')
      .select('id, clicks')
      .eq('scheduled_post_id', postId)
      .eq('platform', platform)
      .single();

    if (fetchError) {
      console.error('Error fetching analytics:', fetchError);
      // Don't fail the request, just log it
    } else if (analytics) {
      // Increment clicks
      const { error: updateError } = await supabase
        .from('social_post_analytics')
        .update({ clicks: analytics.clicks + 1 })
        .eq('id', analytics.id);

      if (updateError) {
        console.error('Error updating clicks:', updateError);
      } else {
        console.log(`Incremented clicks for post ${postId} on ${platform}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, post_id: postId, platform }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in track-social-click:', error);
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
