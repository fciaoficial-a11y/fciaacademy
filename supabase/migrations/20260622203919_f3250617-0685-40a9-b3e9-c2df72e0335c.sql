
CREATE POLICY "Admins manage course-assets" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'course-assets' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'course-assets' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated read course-assets" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-assets');
