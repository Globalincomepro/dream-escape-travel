-- Grant ambassador role to Charles Potter
INSERT INTO public.user_roles (user_id, role)
VALUES ('9fa3119f-bb07-4885-91ca-74ff6dee5b15', 'ambassador')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create ambassador funnel record
INSERT INTO public.ambassador_funnels (
  user_id,
  funnel_slug,
  custom_headline,
  custom_bio,
  is_active
) VALUES (
  '9fa3119f-bb07-4885-91ca-74ff6dee5b15',
  'donna-charles-potter',
  'Travel More. Stress Less. Earn Along the Way.',
  'Join us in discovering how to make luxury travel affordable and accessible for everyone.',
  true
)
ON CONFLICT (user_id) DO NOTHING;