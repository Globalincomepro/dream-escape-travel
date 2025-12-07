import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeadData {
  full_name: string;
  email: string;
  phone?: string | null;
  source: string;
  funnel_slug?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  preferred_contact_time?: string | null;
  intent?: string | null;
}

export const useSubmitLead = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: LeadData) => {
      // Fetch ambassador_id from funnel_slug if provided
      let ambassadorId = null;
      if (data.funnel_slug) {
        const { data: funnel } = await supabase
          .from('ambassador_funnels')
          .select('user_id')
          .eq('funnel_slug', data.funnel_slug)
          .single();
        
        ambassadorId = funnel?.user_id || null;
      }

      // Insert lead into database
      const { data: leadData, error } = await supabase.from('leads').insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        source: data.source,
        funnel_slug: data.funnel_slug || null,
        ambassador_id: ambassadorId,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        preferred_contact_time: data.preferred_contact_time || null,
        intent: data.intent || null,
        status: 'prospect',
      }).select().single();

      if (error) {
        console.error('Lead insert error:', error);
        throw error;
      }

      // Try to send admin notification email (don't fail if it doesn't work)
      try {
        await supabase.functions.invoke('notify-admin-new-lead', {
          body: {
            lead: {
              full_name: data.full_name,
              email: data.email,
              phone: data.phone || '',
              preferred_contact_time: data.preferred_contact_time || 'Not specified',
              source: data.source,
              funnel_slug: data.funnel_slug,
              utm_source: data.utm_source,
              utm_medium: data.utm_medium,
              utm_campaign: data.utm_campaign,
              intent: data.intent,
              created_at: leadData?.created_at,
            },
            adminEmail: 'fyifromcharles@gmail.com',
          },
        });
      } catch (emailError) {
        console.warn('Admin notification failed (non-critical):', emailError);
      }

      // Try to send welcome email to lead (don't fail if it doesn't work)
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            name: data.full_name,
            email: data.email,
            preferredContactTime: data.preferred_contact_time || 'Not specified',
            intent: data.intent,
          },
        });
      } catch (emailError) {
        console.warn('Welcome email failed (non-critical):', emailError);
      }

      return leadData;
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Your information has been submitted successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to submit lead:', error);
      toast({
        title: 'Submission Failed',
        description: error?.message || 'There was an error submitting your request. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
