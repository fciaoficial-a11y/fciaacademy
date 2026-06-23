
-- ============== ROLES ==============
CREATE TYPE public.app_role AS ENUM ('admin', 'aluno');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Default aluno role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- ============== TRACKS ==============
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tag TEXT NOT NULL,
  level TEXT NOT NULL,
  hours TEXT NOT NULL,
  modules INT NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  outcomes TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tracks TO anon, authenticated;
GRANT ALL ON public.tracks TO service_role;

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published tracks" ON public.tracks
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage tracks" ON public.tracks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============== COURSES ==============
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Iniciante',
  cover_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_track_id ON public.courses(track_id);
CREATE INDEX idx_courses_published ON public.courses(is_published);

GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published courses" ON public.courses
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_tracks_updated BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== STORAGE: avatars ==============
CREATE POLICY "Avatars readable by authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============== SEED ==============
INSERT INTO public.tracks (slug, title, description, tag, level, hours, modules, icon, outcomes, sort_order) VALUES
('ia-aplicada', 'IA Aplicada ao Trabalho', 'Domine ChatGPT, agentes, automações e prompts avançados para produtividade real.', 'Inteligência Artificial', 'Iniciante → Avançado', '42h', 8, 'Bot', ARRAY['Construir agentes de IA para sua rotina','Automatizar fluxos repetitivos com n8n e Zapier','Aplicar prompts avançados em qualquer área'], 1),
('dev-moderno', 'Desenvolvimento Moderno', 'Construa produtos digitais com as stacks mais valorizadas e ship rápido.', 'Tecnologia', 'Do zero ao profissional', '120h', 14, 'Code2', ARRAY['Publicar produtos full-stack com React e TypeScript','Trabalhar com APIs, banco de dados e deploy','Montar portfólio pronto para o mercado'], 2),
('empreendedorismo', 'Empreendedorismo Digital', 'Valide, lance e escale um negócio digital com IA, automações e aquisição moderna.', 'Negócios', 'Prática guiada', '36h', 7, 'Rocket', ARRAY['Validar uma oferta em menos de 30 dias','Estruturar funil, marca e operação','Aplicar IA em vendas, marketing e produto'], 3),
('renda-com-ia', 'Renda com IA e Freelas', 'Monte serviços, ofertas e produtos digitais usando IA para gerar renda real.', 'Renda', 'Aplicação imediata', '28h', 6, 'DollarSign', ARRAY['Lançar 3 ofertas usando IA','Conquistar os primeiros clientes pagantes','Estruturar entrega e precificação'], 4),
('profissional-do-futuro', 'Profissional do Futuro', 'Reposicione sua carreira com dados, IA e as habilidades mais demandadas.', 'Carreira', 'Trilha guiada', '54h', 9, 'TrendingUp', ARRAY['Reescrever seu posicionamento profissional','Dominar ferramentas de dados e IA','Conquistar entrevistas em vagas seniores'], 5),
('inovacao', 'Mentalidade de Inovação', 'Pense como produto, decida com dados e aplique frameworks para resolver problemas reais.', 'Inovação', 'Para líderes e times', '24h', 5, 'Brain', ARRAY['Liderar squads com mentalidade de produto','Aplicar discovery e métricas de impacto','Tomar decisões orientadas a dados'], 6);

-- Courses seed (3 per track)
WITH t AS (SELECT id, slug FROM public.tracks)
INSERT INTO public.courses (track_id, slug, title, description, duration_minutes, level, sort_order)
SELECT t.id, c.slug, c.title, c.description, c.dur, c.lvl, c.ord FROM t JOIN (VALUES
  ('ia-aplicada','ia-fundamentos','Fundamentos de IA Generativa','Entenda LLMs, embeddings e como a IA generativa funciona na prática.',240,'Iniciante',1),
  ('ia-aplicada','prompts-avancados','Engenharia de Prompts Avançada','Domine frameworks de prompts para resultados consistentes.',300,'Intermediário',2),
  ('ia-aplicada','agentes-ia','Agentes Autônomos com IA','Construa agentes que executam tarefas reais com ferramentas.',420,'Avançado',3),
  ('dev-moderno','react-typescript','React + TypeScript do Zero','Domine a stack mais usada do mercado moderno.',600,'Iniciante',1),
  ('dev-moderno','fullstack-supabase','Full-Stack com Supabase','Banco, auth e APIs sem servidor próprio.',540,'Intermediário',2),
  ('dev-moderno','deploy-edge','Deploy Edge e Performance','Publique apps rápidos com Cloudflare e Vercel.',360,'Avançado',3),
  ('empreendedorismo','validacao-oferta','Validação de Oferta em 30 dias','Teste sua ideia com clientes reais antes de construir.',240,'Iniciante',1),
  ('empreendedorismo','funil-aquisicao','Funil de Aquisição Moderno','Estruture marketing, vendas e retenção com IA.',300,'Intermediário',2),
  ('empreendedorismo','operacao-enxuta','Operação Enxuta com IA','Automatize processos do seu negócio digital.',360,'Avançado',3),
  ('renda-com-ia','primeiros-clientes','Primeiros Clientes com IA','Conquiste seus primeiros clientes pagantes em 30 dias.',180,'Iniciante',1),
  ('renda-com-ia','servicos-produtizados','Serviços Produtizados','Transforme serviços em ofertas escaláveis.',240,'Intermediário',2),
  ('renda-com-ia','produtos-digitais','Produtos Digitais com IA','Crie e venda produtos digitais gerados com IA.',300,'Avançado',3),
  ('profissional-do-futuro','posicionamento','Posicionamento Profissional','Reescreva sua narrativa para o mercado atual.',180,'Iniciante',1),
  ('profissional-do-futuro','dados-ia','Dados e IA no Trabalho','Use dados e IA para decisões diárias.',360,'Intermediário',2),
  ('profissional-do-futuro','entrevistas-seniores','Entrevistas em Vagas Sêniores','Prepare-se para processos seletivos exigentes.',240,'Avançado',3),
  ('inovacao','mentalidade-produto','Mentalidade de Produto','Pense como product manager em qualquer função.',180,'Iniciante',1),
  ('inovacao','discovery-metricas','Discovery e Métricas de Impacto','Descubra problemas certos e meça resultados.',240,'Intermediário',2),
  ('inovacao','lideranca-squads','Liderança de Squads','Lidere times de alta performance.',300,'Avançado',3)
) AS c(track_slug, slug, title, description, dur, lvl, ord)
ON t.slug = c.track_slug;
