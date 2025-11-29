import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSubmitLead } from '@/hooks/useSubmitLead';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .max(20, { message: "Phone must be less than 20 characters" })
    .optional()
    .or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface LeadCaptureFormProps {
  funnelSlug?: string;
  source?: string;
}

export const LeadCaptureForm = ({ 
  funnelSlug,
  source = 'landing_page' 
}: LeadCaptureFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const submitLead = useSubmitLead();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      await submitLead.mutateAsync({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        source: source,
        funnel_slug: funnelSlug || searchParams.get('funnel') || undefined,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
      });

      // Redirect to webinar page after successful submission
      navigate('/webinar?registered=true');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card/50 backdrop-blur-sm p-8 rounded-lg border border-border shadow-lg">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Email *</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="john@example.com" 
                    {...field}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Phone (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    placeholder="+1 (555) 123-4567" 
                    {...field}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-[var(--shadow-soft)] text-lg py-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Watch the Video Now'
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            By submitting, you agree to receive updates about our travel program.
          </p>
        </form>
      </Form>
    </div>
  );
};
