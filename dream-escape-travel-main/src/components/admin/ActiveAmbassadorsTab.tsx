import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, TrendingUp, Calendar, Link as LinkIcon, Award } from "lucide-react";

interface Ambassador {
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
  ambassador_funnels: Array<{
    funnel_slug: string;
  }>;
  lead_count: number;
  post_count: number;
  funnel_views: number;
}

export const ActiveAmbassadorsTab = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      // Fetch ambassadors with their roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id, created_at")
        .eq("role", "ambassador");

      if (roleError) throw roleError;

      // Fetch detailed info for each ambassador
      const ambassadorDetails = await Promise.all(
        (roleData || []).map(async (role) => {
          const [profile, funnel, leads, posts, analytics] = await Promise.all([
            supabase.from("profiles").select("full_name, email, avatar_url").eq("id", role.user_id).single(),
            supabase.from("ambassador_funnels").select("funnel_slug").eq("user_id", role.user_id),
            supabase.from("leads").select("id", { count: "exact", head: true }).eq("ambassador_id", role.user_id),
            supabase.from("scheduled_posts").select("id", { count: "exact", head: true }).eq("ambassador_id", role.user_id),
            supabase.from("funnel_analytics").select("id", { count: "exact", head: true }).eq("ambassador_id", role.user_id).eq("event_type", "page_view"),
          ]);

          return {
            user_id: role.user_id,
            created_at: role.created_at,
            profiles: profile.data || { full_name: "", email: "", avatar_url: "" },
            ambassador_funnels: funnel.data || [],
            lead_count: leads.count || 0,
            post_count: posts.count || 0,
            funnel_views: analytics.count || 0,
          };
        })
      );

      setAmbassadors(ambassadorDetails);
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
      toast({
        title: "Error",
        description: "Failed to load ambassadors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceBadge = (ambassador: Ambassador) => {
    if (ambassador.lead_count > 100) {
      return { label: "Top Performer", variant: "default" as const, icon: Award };
    }
    
    const joinDate = new Date(ambassador.created_at);
    const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceJoin < 30 && ambassador.lead_count > 20) {
      return { label: "Rising Star", variant: "secondary" as const, icon: TrendingUp };
    }
    
    if (ambassador.post_count > 50) {
      return { label: "Social Pro", variant: "outline" as const, icon: Users };
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ambassadors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No Active Ambassadors</p>
          <p className="text-sm text-muted-foreground mt-2">
            Approve applications to see ambassadors here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ambassadors.map((ambassador) => {
        const badge = getPerformanceBadge(ambassador);
        const BadgeIcon = badge?.icon;

        return (
          <Card key={ambassador.user_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {ambassador.profiles.avatar_url ? (
                      <img
                        src={ambassador.profiles.avatar_url}
                        alt={ambassador.profiles.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                    )}
                    {ambassador.profiles.full_name || "Unknown"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {ambassador.profiles.email}
                  </CardDescription>
                </div>
                {badge && BadgeIcon && (
                  <Badge variant={badge.variant} className="flex items-center gap-1">
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {new Date(ambassador.created_at).toLocaleDateString()}
              </div>

              <div className="bg-muted p-3 rounded-md space-y-2">
                <p className="font-medium text-sm">Performance:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{ambassador.lead_count}</div>
                    <div className="text-xs text-muted-foreground">Leads</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{ambassador.funnel_views}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{ambassador.post_count}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                </div>
              </div>

              {ambassador.ambassador_funnels.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`/f/${ambassador.ambassador_funnels[0].funnel_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    /f/{ambassador.ambassador_funnels[0].funnel_slug}
                  </a>
                </div>
              )}

              <Button variant="outline" className="w-full" size="sm">
                View Details
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
