import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSubmitLead } from '@/hooks/useSubmitLead';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const formSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be less than 20 characters'),
  preferred_contact_time: z.string().min(1, 'Please select a preferred time'),
  intent: z.enum(['join_now', 'need_info'], {
    required_error: "Please select an option"
  }),
});

type FormData = z.infer<typeof formSchema>;

interface WebinarGetStartedFormProps {
  onSuccess: (intent: string) => void;
}

export const WebinarGetStartedForm = ({ onSuccess }: WebinarGetStartedFormProps) => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLead = useSubmitLead();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      preferred_contact_time: '',
      intent: 'join_now',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await submitLead.mutateAsync({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        preferred_contact_time: data.preferred_contact_time,
        intent: data.intent,
        source: 'webinar',
        funnel_slug: searchParams.get('ref') || null,
        utm_source: searchParams.get('utm_source') || null,
        utm_medium: searchParams.get('utm_medium') || null,
        utm_campaign: searchParams.get('utm_campaign') || null,
      });

      // Branch based on intent
      if (data.intent === 'join_now') {
        // Open MWR sign-up page in new tab
        window.open('https://www.mwrlife.com/gocpotter', '_blank');
      }

      onSuccess(data.intent);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
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
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
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
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_contact_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Contact Time *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select best time to call" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Morning (8am-12pm)">Morning (8am-12pm)</SelectItem>
                    <SelectItem value="Afternoon (12pm-5pm)">Afternoon (12pm-5pm)</SelectItem>
                    <SelectItem value="Evening (5pm-8pm)">Evening (5pm-8pm)</SelectItem>
                    <SelectItem value="Anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What best describes you? *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="join_now">
                      ✅ I'm ready to join MWR Life now!
                    </SelectItem>
                    <SelectItem value="need_info">
                      ❓ I have questions before joining
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg py-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Get Started Now'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to receive communications about travel opportunities. 
            Your information is secure and will never be shared.
          </p>
        </form>
      </Form>
    </div>
  );
};
