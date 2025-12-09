import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SocialSettingsTabProps {
  initialWebhookUrl: string | null;
  userId: string;
  onUpdate: () => void;
}

export function SocialSettingsTab({ initialWebhookUrl, userId, onUpdate }: SocialSettingsTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validate webhook URL format
    if (webhookUrl && !webhookUrl.startsWith("https://hooks.zapier.com/")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Zapier webhook URL",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("ambassador_funnels")
        .update({ zapier_webhook_url: webhookUrl || null })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Zapier webhook URL saved successfully"
      });

      onUpdate();
    } catch (error: any) {
      console.error("Error saving webhook URL:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Social Media Automation</h2>
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Create a free Zapier account at <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">zapier.com</a></li>
            <li>Create a new Zap with "Webhooks by Zapier" as the trigger</li>
            <li>Choose "Catch Hook" and copy the webhook URL provided</li>
            <li>Connect your social media accounts (Facebook, Instagram, Twitter, LinkedIn)</li>
            <li>Paste your webhook URL below and click Save</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Zapier Webhook URL</label>
            <Input
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              This webhook will be used to automatically post your content to social media
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {webhookUrl ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm font-medium">Not Connected</span>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Webhook URL
            </Button>
          </div>

          <Button 
            variant="outline" 
            onClick={() => navigate('/ambassador/content')}
            className="w-full"
          >
            Go to Content Hub
          </Button>
        </div>
      </div>
    </Card>
  );
}
