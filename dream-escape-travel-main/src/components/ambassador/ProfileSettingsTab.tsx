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
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  tagline: z.string().max(100, "Tagline must be less than 100 characters").optional().nullable(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
  avatar_url: z.string().url().optional().nullable().or(z.literal(""))
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsTabProps {
  initialData: ProfileFormData;
  userId: string;
  onUpdate: () => void;
}

export function ProfileSettingsTab({ initialData, userId, onUpdate }: ProfileSettingsTabProps) {
  const { toast } = useToast();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          tagline: data.tagline || null,
          bio: data.bio || null,
          avatar_url: data.avatar_url || null
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  bucketName="avatars"
                  currentImageUrl={field.value || null}
                  onUploadComplete={(url) => {
                    field.onChange(url);
                    form.handleSubmit(onSubmit)();
                  }}
                  maxSizeMB={2}
                  acceptedTypes={['jpg', 'jpeg', 'png', 'webp']}
                  aspectRatio="1/1"
                  label="Profile Avatar"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Travel Expert & MWR Ambassador" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/100 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell your story..." 
                  rows={5}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Save Profile
        </Button>
      </form>
    </Form>
  );
}
