-- Add UPDATE policy for admins
CREATE POLICY "Admins can update all scheduled posts"
ON public.scheduled_posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add INSERT policy for admins
CREATE POLICY "Admins can insert scheduled posts"
ON public.scheduled_posts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add DELETE policy for admins
CREATE POLICY "Admins can delete scheduled posts"
ON public.scheduled_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));