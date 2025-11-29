import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";

const linksSchema = z.object({
  vip_join_url: z.string().url("Please enter a valid URL").optional().nullable(),
  guest_pass_url: z.string().url("Please enter a valid URL").optional().nullable()
});

type LinksFormData = z.infer<typeof linksSchema>;

interface LinksSettingsTabProps {
  initialData: LinksFormData;
  userId: string;
  onUpdate: () => void;
}

export function LinksSettingsTab({ initialData, userId, onUpdate }: LinksSettingsTabProps) {
  const { toast } = useToast();
  const form = useForm<LinksFormData>({
    resolver: zodResolver(linksSchema),
    defaultValues: initialData
  });

  const onSubmit = async (data: LinksFormData) => {
    try {
      const { error } = await supabase
        .from("ambassador_funnels")
        .update({
          vip_join_url: data.vip_join_url || null,
          guest_pass_url: data.guest_pass_url || null
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Links updated",
        description: "Your URLs have been saved successfully"
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const testLink = (url: string | null | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vip_join_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIP Join URL</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="https://www.mwrlife.com/your-link"
                    type="url"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => testLink(field.value)}
                  disabled={!field.value}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <FormDescription>
                Where prospects go when they click "Join Now" on your funnel page
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guest_pass_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest Pass URL</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="https://example.com/guest-pass"
                    type="url"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => testLink(field.value)}
                  disabled={!field.value}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <FormDescription>
                URL for guest pass redemption (future feature)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Save Links
        </Button>
      </form>
    </Form>
  );
}
