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
    const { postId } = await req.json();
    console.log('Received request for postId:', postId);

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Missing postId' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Get the authenticated user by validating the JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    console.log('User authentication result:', { 
      success: !!user, 
      userId: user?.id,
      error: userError?.message 
    });
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log(`Fetching post ${postId} for user ${user.id}`);

    // Get the scheduled post
    const { data: post, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Error fetching post:', fetchError);
      throw new Error('Post not found');
    }

    // Check if user is admin OR owns this post
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      });

    console.log('Admin check:', { isAdmin, roleError });

    // Allow if admin OR if user owns the post
    if (!isAdmin && post.ambassador_id !== user.id) {
      console.error('User is not admin and does not own this post');
      throw new Error('Unauthorized - only ambassadors can post their own content, or admins can post for any ambassador');
    }

    const actorType = isAdmin ? 'admin' : 'ambassador';
    console.log(`Sending post ${postId} as ${actorType} for ambassador ${post.ambassador_id}`);

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

    // Update status to processing
    await supabase
      .from('scheduled_posts')
      .update({ status: 'processing' })
      .eq('id', post.id);

    // Get funnel slug
    const funnelSlug = funnel?.funnel_slug || 'default';
    // Use the correct Lovable preview domain
    const appDomain = '06c391fc-722a-44fc-9eb7-d8ce2835f36b.lovableproject.com';
    const funnelLink = `https://${appDomain}/f/${funnelSlug}?ref=social&post_id=${post.id}`;

    // Build caption with funnel link
    let caption = post.custom_caption || '';
    if (!caption.includes('http')) {
      caption += `\n\n🌍 Book your dream vacation: ${funnelLink}`;
    }

    // Get image URL from the scheduled post's content fields
    const rawImageUrl = post.content_file_url || post.content_thumbnail_url || '';
    const ambassadorName = profile?.full_name || 'Ambassador';

    // Add image transformation parameters to force Supabase to process through CDN
    // This adds proper headers that Facebook expects (Content-Type, Cache-Control, etc.)
    const imageUrl = rawImageUrl.includes('supabase.co/storage/v1/object/public/')
      ? `${rawImageUrl}?width=1200&quality=85`
      : rawImageUrl;

    console.log('Image URL transformation:', {
      original: rawImageUrl,
      transformed: imageUrl,
      hasTransformation: rawImageUrl !== imageUrl
    });

    // Prepare payload for Zapier
    const payload = {
      caption,
      image_url: imageUrl,
      platforms: post.platforms,
      ambassador_name: ambassadorName,
      post_id: post.id,
      funnel_link: funnelLink
    };

    console.log('=== ZAPIER WEBHOOK REQUEST ===');
    console.log('Webhook URL:', post.zapier_webhook_url);
    console.log('Payload being sent:', JSON.stringify(payload, null, 2));

    // Send to Zapier webhook
    const zapierResponse = await fetch(post.zapier_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('=== ZAPIER RESPONSE ===');
    console.log('Status:', zapierResponse.status);
    const responseText = await zapierResponse.text();
    console.log('Response body:', responseText);

    if (!zapierResponse.ok) {
      throw new Error(`Zapier webhook failed: ${zapierResponse.status} - ${responseText}`);
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

    console.log(`Successfully sent post ${post.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Post sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-social-post:', error);
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
