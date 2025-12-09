import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SchedulePostModalProps {
  open: boolean;
  onClose: () => void;
  content: {
    id: string;
    file_url: string;
    thumbnail_url?: string;
    caption_text?: string;
    caption?: string;
  };
  userId: string;
  onScheduled: () => void;
}

export function SchedulePostModal({ open, onClose, content, userId, onScheduled }: SchedulePostModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState(content.caption_text || content.caption || "");
  const [platforms, setPlatforms] = useState<string[]>(["facebook", "instagram"]);
  const [frequency, setFrequency] = useState("once");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [dailyTimes, setDailyTimes] = useState(["09:00", "13:00", "18:00"]);
  const [days, setDays] = useState("7");

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePostNow = async () => {
    if (platforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Post Now: Starting immediate post process');

    try {
      // Get ambassador's funnel for webhook URL
      console.log('Post Now: Fetching ambassador funnel');
      const { data: funnel, error: funnelError } = await supabase
        .from("ambassador_funnels")
        .select("zapier_webhook_url")
        .eq("user_id", userId)
        .single();

      if (funnelError) {
        console.error('Post Now: Error fetching funnel:', funnelError);
        throw funnelError;
      }

      const webhookUrl = funnel?.zapier_webhook_url || "";
      
      if (!webhookUrl) {
        toast({
          title: "Setup Required",
          description: "Please configure your Zapier webhook in Settings first",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create a temporary scheduled post record with immediate time
      console.log('Post Now: Creating temporary scheduled post record');
      const { data: scheduledPost, error: insertError } = await supabase
        .from("scheduled_posts")
        .insert({
          ambassador_id: userId,
          content_id: null, // No foreign key constraint needed
          content_file_url: content.file_url,
          content_thumbnail_url: content.thumbnail_url,
          platforms,
          custom_caption: caption,
          scheduled_time: new Date().toISOString(), // Set to now for immediate posting
          status: 'pending',
          zapier_webhook_url: webhookUrl
        })
        .select()
        .single();

      if (insertError) {
        console.error('Post Now: Error creating scheduled post:', insertError);
        throw insertError;
      }

      console.log('Post Now: Scheduled post created with ID:', scheduledPost.id);

      // Call the send-social-post edge function
      console.log('Post Now: Calling send-social-post edge function');
      const { data, error: functionError } = await supabase.functions.invoke('send-social-post', {
        body: { postId: scheduledPost.id }
      });

      if (functionError) {
        console.error('Post Now: Edge function error:', functionError);
        throw new Error(`Failed to send post: ${functionError.message}`);
      }

      console.log('Post Now: Edge function response:', data);

      toast({
        title: "Success",
        description: "Post sent to your social media accounts!"
      });

      onScheduled();
      onClose();
    } catch (error: any) {
      console.error("Post Now: Error:", error);
      toast({
        title: "Error posting to social media",
        description: error.message || "Failed to post. Please try again or schedule for later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (platforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive"
      });
      return;
    }

    if (!scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get ambassador's funnel and webhook URL
      const { data: funnel, error: funnelError } = await supabase
        .from("ambassador_funnels")
        .select("id, zapier_webhook_url")
        .eq("user_id", userId)
        .single();

      if (funnelError) throw funnelError;

      const webhookUrl = funnel.zapier_webhook_url || "";

      if (!webhookUrl) {
        toast({
          title: "Setup Required",
          description: "Please configure your Zapier webhook in Settings first",
          variant: "destructive"
        });
        onClose();
        return;
      }

      // Generate schedule times based on frequency
      const scheduleTimes: Date[] = [];
      const baseDate = new Date(`${scheduledDate}T${scheduledTime}`);

      if (frequency === "once") {
        scheduleTimes.push(baseDate);
      } else if (frequency === "daily") {
        for (let i = 0; i < parseInt(days); i++) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() + i);
          scheduleTimes.push(date);
        }
      } else if (frequency === "3x-daily") {
        for (let i = 0; i < parseInt(days); i++) {
          for (const time of dailyTimes) {
            const [hours, minutes] = time.split(":");
            const date = new Date(scheduledDate);
            date.setDate(date.getDate() + i);
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            scheduleTimes.push(date);
          }
        }
      }

      // Insert scheduled posts
      const posts = scheduleTimes.map(time => ({
        ambassador_id: userId,
        content_id: null, // No foreign key constraint needed
        content_file_url: content.file_url,
        content_thumbnail_url: content.thumbnail_url,
        custom_caption: caption,
        scheduled_time: time.toISOString(),
        status: 'pending',
        platforms,
        zapier_webhook_url: webhookUrl
      }));

      const { error: insertError } = await supabase
        .from("scheduled_posts")
        .insert(posts);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `${posts.length} post(s) scheduled successfully`
      });

      onScheduled();
      onClose();
    } catch (error: any) {
      console.error("Error scheduling posts:", error);
      toast({
        title: "Error scheduling posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Social Media Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Preview */}
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
            <img
              src={content.thumbnail_url || content.file_url}
              alt="Post preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Caption Editor */}
          <div>
            <Label>Caption</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add your personal message..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Caption Preview with Link */}
          {caption && (
            <div className="space-y-2">
              <Label>Preview (what will be posted)</Label>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap border">
                {caption}
                {"\n\n"}
                🌍 Book your dream vacation: [Your funnel link will be added here]
              </div>
              <p className="text-xs text-muted-foreground">
                Your personalized funnel link with post tracking will be automatically added
              </p>
            </div>
          )}

          {/* Platform Selection */}
          <div>
            <Label className="mb-3 block">Platforms</Label>
            <div className="space-y-2">
              {[
                { id: "facebook", label: "Facebook" },
                { id: "instagram", label: "Instagram" },
                { id: "twitter", label: "Twitter/X" },
                { id: "linkedin", label: "LinkedIn" }
              ].map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={platforms.includes(platform.id)}
                    onCheckedChange={() => togglePlatform(platform.id)}
                  />
                  <label
                    htmlFor={platform.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {platform.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency Selection */}
          <div>
            <Label className="mb-3 block">Posting Frequency</Label>
            <RadioGroup value={frequency} onValueChange={setFrequency}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="once" id="once" />
                <Label htmlFor="once">Post Once</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Post Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3x-daily" id="3x-daily" />
                <Label htmlFor="3x-daily">Post 3x Daily</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Start Date</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-2"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {frequency === "once" && (
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Additional Options for Recurring Posts */}
          {(frequency === "daily" || frequency === "3x-daily") && (
            <div>
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                max="30"
                className="mt-2"
              />
            </div>
          )}

          {frequency === "3x-daily" && (
            <div>
              <Label className="mb-2 block">Post Times</Label>
              <div className="grid grid-cols-3 gap-2">
                {dailyTimes.map((time, index) => (
                  <Input
                    key={index}
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...dailyTimes];
                      newTimes[index] = e.target.value;
                      setDailyTimes(newTimes);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handlePostNow} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Post Now
            </Button>
            <Button onClick={handleSchedule} disabled={loading || !scheduledDate}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
