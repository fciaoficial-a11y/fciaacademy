-- Permite SELECT de cursos publicados para usuários autenticados.
-- Necessário para createPixCharge (usa context.supabase com auth) consultar is_published em courses.
-- Mantém todas as policies existentes intactas.

CREATE POLICY "courses_select_published_authenticated"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (is_published = true);
