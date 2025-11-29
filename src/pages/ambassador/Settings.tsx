import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettingsTab } from "@/components/ambassador/ProfileSettingsTab";
import { FunnelSettingsTab } from "@/components/ambassador/FunnelSettingsTab";
import { LinksSettingsTab } from "@/components/ambassador/LinksSettingsTab";
import { PreviewTab } from "@/components/ambassador/PreviewTab";
import { GallerySettingsTab } from "@/components/ambassador/GallerySettingsTab";
import { SocialSettingsTab } from "@/components/ambassador/SocialSettingsTab";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  profile: {
    full_name: string;
    tagline: string | null;
    bio: string | null;
    avatar_url: string | null;
  };
  funnel: {
    id: string;
    custom_headline: string | null;
    custom_bio: string | null;
    hero_image_url: string | null;
    vip_join_url: string | null;
    guest_pass_url: string | null;
    funnel_slug: string;
    is_active: boolean;
    zapier_webhook_url: string | null;
  };
  stats: {
    pageViews: number;
    leads: number;
    conversions: number;
  };
}

export default function AmbassadorSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [data, setData] = useState<SettingsData | null>(null);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, tagline, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Load funnel
      const { data: funnel, error: funnelError } = await supabase
        .from("ambassador_funnels")
        .select("id, custom_headline, custom_bio, hero_image_url, vip_join_url, guest_pass_url, funnel_slug, is_active, zapier_webhook_url")
        .eq("user_id", user.id)
        .single();

      if (funnelError) throw funnelError;

      // Load stats
      const { count: pageViews } = await supabase
        .from("funnel_analytics")
        .select("*", { count: "exact", head: true })
        .eq("ambassador_id", user.id)
        .eq("event_type", "page_view");

      const { count: leads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("ambassador_id", user.id);

      const { count: conversions } = await supabase
        .from("funnel_analytics")
        .select("*", { count: "exact", head: true })
        .eq("ambassador_id", user.id)
        .eq("event_type", "conversion");

      setData({
        profile,
        funnel,
        stats: {
          pageViews: pageViews || 0,
          leads: leads || 0,
          conversions: conversions || 0
        }
      });
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-muted-foreground">Failed to load settings</p>
          <Button onClick={() => navigate("/ambassador/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ambassador/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Funnel Settings</h1>
            <p className="text-muted-foreground">Customize your ambassador funnel</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <ProfileSettingsTab
                initialData={data.profile}
                userId={userId}
                onUpdate={loadData}
              />
            </Card>
          </TabsContent>

          <TabsContent value="funnel">
            <Card className="p-6">
              <FunnelSettingsTab
                initialData={{
                  custom_headline: data.funnel.custom_headline,
                  custom_bio: data.funnel.custom_bio,
                  hero_image_url: data.funnel.hero_image_url
                }}
                userId={userId}
                onUpdate={loadData}
              />
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="p-6">
              <GallerySettingsTab funnelId={data.funnel.id} />
            </Card>
          </TabsContent>

          <TabsContent value="links">
            <Card className="p-6">
              <LinksSettingsTab
                initialData={{
                  vip_join_url: data.funnel.vip_join_url,
                  guest_pass_url: data.funnel.guest_pass_url
                }}
                userId={userId}
                onUpdate={loadData}
              />
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <SocialSettingsTab
              initialWebhookUrl={data.funnel.zapier_webhook_url}
              userId={userId}
              onUpdate={loadData}
            />
          </TabsContent>

          <TabsContent value="preview">
            <PreviewTab
              funnelSlug={data.funnel.funnel_slug}
              isActive={data.funnel.is_active}
              userId={userId}
              stats={data.stats}
              onUpdate={loadData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
