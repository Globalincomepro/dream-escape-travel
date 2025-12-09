import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, Eye, BarChart3 } from "lucide-react";

interface PreviewTabProps {
  funnelSlug: string;
  isActive: boolean;
  userId: string;
  stats: {
    pageViews: number;
    leads: number;
    conversions: number;
  };
  onUpdate: () => void;
}

export function PreviewTab({ funnelSlug, isActive, userId, stats, onUpdate }: PreviewTabProps) {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const funnelUrl = `${window.location.origin}/f/${funnelSlug}`;

  const toggleActive = async (checked: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("ambassador_funnels")
        .update({ is_active: checked })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: checked ? "Funnel activated" : "Funnel deactivated",
        description: checked 
          ? "Your funnel is now live and accessible" 
          : "Your funnel has been taken offline"
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(funnelUrl);
    toast({
      title: "Copied!",
      description: "Funnel URL copied to clipboard"
    });
  };

  const openPreview = () => {
    window.open(funnelUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Funnel Status</Label>
            <p className="text-sm text-muted-foreground">
              {isActive ? "Your funnel is live" : "Your funnel is inactive"}
            </p>
          </div>
          <Switch 
            checked={isActive} 
            onCheckedChange={toggleActive}
            disabled={updating}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Your Funnel URL</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={funnelUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
          />
          <Button variant="outline" size="icon" onClick={copyUrl}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={openPreview}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Performance Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-primary">{stats.pageViews}</p>
            <p className="text-sm text-muted-foreground">Page Views</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats.leads}</p>
            <p className="text-sm text-muted-foreground">Leads</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats.conversions}</p>
            <p className="text-sm text-muted-foreground">Conversions</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={openPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Your Funnel
          </Button>
        </div>
      </Card>
    </div>
  );
}
