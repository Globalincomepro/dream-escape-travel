import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, TrendingUp, MousePointerClick, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlatformStats {
  platform: string;
  clicks: number;
  conversions: number;
}

interface TopContent {
  id: string;
  title: string;
  thumbnail_url: string;
  clicks: number;
  conversions: number;
}

export default function SocialAnalytics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [topContent, setTopContent] = useState<TopContent[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load total posts
      const { count: postsCount } = await supabase
        .from("scheduled_posts")
        .select("*", { count: "exact", head: true })
        .eq("ambassador_id", user.id)
        .eq("status", "posted");

      setTotalPosts(postsCount || 0);

      // Load analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from("social_post_analytics")
        .select("*")
        .eq("ambassador_id", user.id);

      if (analyticsError) throw analyticsError;

      // Calculate totals
      const clicks = analytics?.reduce((sum, a) => sum + a.clicks, 0) || 0;
      const conversions = analytics?.reduce((sum, a) => sum + a.conversions, 0) || 0;
      setTotalClicks(clicks);
      setTotalConversions(conversions);

      // Group by platform
      const platformMap = new Map<string, { clicks: number; conversions: number }>();
      analytics?.forEach(a => {
        const existing = platformMap.get(a.platform) || { clicks: 0, conversions: 0 };
        platformMap.set(a.platform, {
          clicks: existing.clicks + a.clicks,
          conversions: existing.conversions + a.conversions
        });
      });

      const platformData = Array.from(platformMap.entries()).map(([platform, stats]) => ({
        platform,
        ...stats
      })).sort((a, b) => b.clicks - a.clicks);

      setPlatformStats(platformData);

      // Load top performing content
      const { data: topPosts, error: topError } = await supabase
        .from("scheduled_posts")
        .select(`
          id,
          content_file_url,
          content_thumbnail_url,
          custom_caption,
          social_post_analytics (clicks, conversions)
        `)
        .eq("ambassador_id", user.id)
        .eq("status", "posted")
        .order("created_at", { ascending: false })
        .limit(10);

      if (topError) throw topError;

      // Aggregate clicks and conversions for each post
      const contentMap = new Map();
      topPosts?.forEach(post => {
        const postAnalytics = Array.isArray(post.social_post_analytics) 
          ? post.social_post_analytics 
          : [];
        
        const clicks = postAnalytics.reduce((sum: number, a: any) => sum + a.clicks, 0);
        const conversions = postAnalytics.reduce((sum: number, a: any) => sum + a.conversions, 0);

        // Use caption or a generic title
        const title = post.custom_caption?.substring(0, 50) || 'Social Post';
        
        const existing = contentMap.get(post.id);
        if (existing) {
          existing.clicks += clicks;
          existing.conversions += conversions;
        } else {
          contentMap.set(post.id, {
            id: post.id,
            title,
            thumbnail_url: post.content_thumbnail_url || post.content_file_url,
            clicks,
            conversions
          });
        }
      });

      const topContentData = Array.from(contentMap.values())
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      setTopContent(topContentData);
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ambassador/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Social Media Analytics</h1>
            <p className="text-muted-foreground">Track your social media performance</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{totalPosts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MousePointerClick className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{totalClicks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{totalConversions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
            {platformStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4">
                {platformStats.map(platform => {
                  const percentage = totalClicks > 0 
                    ? ((platform.clicks / totalClicks) * 100).toFixed(0) 
                    : "0";
                  return (
                    <div key={platform.platform}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{platform.platform}</span>
                        <span className="text-sm text-muted-foreground">
                          {platform.clicks} clicks ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Top Performing Content */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performing Content</h2>
            {topContent.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4">
                {topContent.map((content, index) => (
                  <div key={content.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <img 
                      src={content.thumbnail_url} 
                      alt={content.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{content.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {content.clicks} clicks • {content.conversions} conversions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
