import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw } from "lucide-react";

const funnelSchema = z.object({
  custom_headline: z.string().max(150, "Headline must be less than 150 characters").optional().nullable(),
  custom_bio: z.string().max(800, "Bio must be less than 800 characters").optional().nullable(),
  hero_image_url: z.string().url().optional().nullable().or(z.literal(""))
});

type FunnelFormData = z.infer<typeof funnelSchema>;

interface FunnelSettingsTabProps {
  initialData: FunnelFormData;
  userId: string;
  onUpdate: () => void;
}

const DEFAULT_HEADLINE = "Transform Your Travel Dreams Into Reality";

export function FunnelSettingsTab({ initialData, userId, onUpdate }: FunnelSettingsTabProps) {
  const { toast } = useToast();
  const form = useForm<FunnelFormData>({
    resolver: zodResolver(funnelSchema),
    defaultValues: initialData
  });

  const onSubmit = async (data: FunnelFormData) => {
    try {
      const { error } = await supabase
        .from("ambassador_funnels")
        .update({
          custom_headline: data.custom_headline || null,
          custom_bio: data.custom_bio || null,
          hero_image_url: data.hero_image_url || null
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Funnel updated",
        description: "Your funnel customization has been saved"
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

  const resetHeadline = () => {
    form.setValue("custom_headline", DEFAULT_HEADLINE);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="hero_image_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  bucketName="hero-images"
                  currentImageUrl={field.value || null}
                  onUploadComplete={(url) => {
                    field.onChange(url);
                    form.handleSubmit(onSubmit)();
                  }}
                  maxSizeMB={5}
                  acceptedTypes={['jpg', 'jpeg', 'png', 'webp']}
                  aspectRatio="16/9"
                  label="Hero Background Image"
                />
              </FormControl>
              <FormDescription>
                Recommended size: 1920x1080px
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="custom_headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Headline</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder={DEFAULT_HEADLINE}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={resetHeadline}
                  title="Reset to default"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <FormDescription>
                {field.value?.length || 0}/150 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="custom_bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Bio / Personal Story</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share your personal travel journey and why you became an ambassador..."
                  rows={8}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/800 characters • This replaces generic copy with your personalized message
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Save Funnel Settings
        </Button>
      </form>
    </Form>
  );
}
