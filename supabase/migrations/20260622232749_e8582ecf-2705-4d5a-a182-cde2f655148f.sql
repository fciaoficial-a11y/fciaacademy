
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS video_url TEXT;

CREATE POLICY "course-videos admin write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-videos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "course-videos admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "course-videos admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "course-videos authenticated read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-videos');
