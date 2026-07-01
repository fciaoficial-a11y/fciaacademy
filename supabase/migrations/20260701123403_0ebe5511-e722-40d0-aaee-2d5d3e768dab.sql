
-- 1) Planos base PRIMEIRO (FK de subscriptions depende disso)
INSERT INTO public.plans (id, name, price, features, sort_order, is_active) VALUES
  ('free',    'Free',    0,     '["Acesso a trilhas gratuitas","Perfil e gamificação","Certificado dos cursos free"]'::jsonb, 0, true),
  ('starter', 'Starter', 29.90, '["Tudo do Free","Trilhas Starter","Suporte por comunidade"]'::jsonb, 1, true),
  ('pro',     'Pro',     59.90, '["Tudo do Starter","Trilhas Pro","Certificados premium","Aulas ao vivo mensais"]'::jsonb, 2, true),
  ('expert',  'Expert',  129.90,'["Tudo do Pro","Trilhas Expert","Mentoria em grupo","Acesso antecipado"]'::jsonb, 3, true)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, price=EXCLUDED.price, features=EXCLUDED.features, sort_order=EXCLUDED.sort_order, is_active=true;

-- 2) Triggers em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
CREATE TRIGGER on_auth_user_created_plan AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_free_plan();

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin();

-- 3) Backfill usuários existentes
INSERT INTO public.profiles (id, full_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name')
FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id
WHERE p.id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'aluno'::app_role FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id=u.id
WHERE r.user_id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.subscriptions (user_id, plan_id, status)
SELECT u.id, 'free', 'active' FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id=u.id
WHERE s.user_id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role FROM auth.users u
WHERE lower(u.email) = 'blindadoemotivado@gmail.com'
ON CONFLICT DO NOTHING;

-- 4) Conteúdo mínimo de beta
DO $$
DECLARE
  v_track_id UUID; v_course_id UUID; v_m1 UUID; v_m2 UUID; v_m3 UUID;
BEGIN
  INSERT INTO public.tracks (slug, title, description, tag, level, hours, modules, icon, outcomes, sort_order, is_published, required_plan)
  VALUES (
    'fundamentos-blindagem-emocional',
    'Fundamentos da Blindagem Emocional',
    'Trilha introdutória da FCIA Academy: entenda os pilares emocionais que sustentam decisões, disciplina e alta performance.',
    'Iniciante', 'Iniciante', '2h', 3, 'Sparkles',
    ARRAY['Compreender a base da blindagem emocional','Aplicar técnicas de autorregulação','Construir rotina emocional sustentável'],
    0, true, 'free'
  )
  ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, is_published=true
  RETURNING id INTO v_track_id;

  INSERT INTO public.courses (track_id, slug, title, description, duration_minutes, level, sort_order, is_published, workload_hours)
  VALUES (
    v_track_id, 'introducao-blindagem-emocional',
    'Introdução à Blindagem Emocional',
    'Curso de abertura da trilha. Conceitos-chave, mapa emocional e primeiros exercícios práticos para blindar a mente contra o caos do dia a dia.',
    120, 'Iniciante', 0, true, 2
  )
  ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, is_published=true, track_id=v_track_id
  RETURNING id INTO v_course_id;

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
  VALUES (v_course_id, 'm1-o-que-e-blindagem', 'O que é blindagem emocional', 'Definição, mitos e por que ela sustenta resultados de longo prazo.', 'text',
    E'# O que é blindagem emocional\n\nBlindagem emocional não é ausência de emoção — é a capacidade de reconhecer, nomear e regular emoções para que decisões não sejam sequestradas pelo estado interno.\n\n## Três pilares\n1. **Consciência** — perceber o que sente sem julgar.\n2. **Regulação** — escolher a resposta, não reagir no impulso.\n3. **Direção** — usar a energia emocional a favor do objetivo.\n\nAo final deste módulo você entende por que a maioria das falhas de execução são emocionais, não técnicas.',
    30, 0, true)
  ON CONFLICT (course_id, slug) DO UPDATE SET title=EXCLUDED.title, content_text=EXCLUDED.content_text, is_published=true
  RETURNING id INTO v_m1;

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
  VALUES (v_course_id, 'm2-mapa-emocional', 'Mapa emocional pessoal', 'Como mapear seus gatilhos e padrões automáticos.', 'text',
    E'# Mapa emocional pessoal\n\nO mapa emocional é o inventário dos seus gatilhos: situações, pessoas e pensamentos que disparam estados improdutivos.\n\n## Passo a passo\n1. Liste os últimos 5 momentos em que perdeu o controle.\n2. Identifique o gatilho comum.\n3. Nomeie a emoção primária (medo, raiva, vergonha, tristeza).\n4. Registre a resposta automática.\n5. Desenhe a resposta desejada.\n\nEsse mapa vira base para todos os exercícios seguintes.',
    45, 1, true)
  ON CONFLICT (course_id, slug) DO UPDATE SET title=EXCLUDED.title, content_text=EXCLUDED.content_text, is_published=true
  RETURNING id INTO v_m2;

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
  VALUES (v_course_id, 'm3-primeiros-exercicios', 'Primeiros exercícios práticos', 'Três técnicas para começar hoje.', 'text',
    E'# Primeiros exercícios práticos\n\n## 1. Respiração 4-7-8\nInspire por 4s, segure 7s, expire 8s. Repita 4 ciclos antes de qualquer decisão importante.\n\n## 2. Journaling de 3 linhas\nAntes de dormir: o que senti hoje, o que aprendi, o que faço diferente amanhã.\n\n## 3. Regra dos 90 segundos\nToda emoção tem meia-vida de 90s no corpo. Se você não alimentar com pensamento, ela passa.\n\nAplique por 7 dias antes do próximo curso.',
    45, 2, true)
  ON CONFLICT (course_id, slug) DO UPDATE SET title=EXCLUDED.title, content_text=EXCLUDED.content_text, is_published=true
  RETURNING id INTO v_m3;

  INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanation, sort_order) VALUES
  (v_m1, 'Blindagem emocional significa:', 'multiple_choice',
    '["Nunca sentir emoções","Reconhecer e regular emoções para decidir melhor","Fingir que está tudo bem","Reprimir toda vulnerabilidade"]'::jsonb,
    'Reconhecer e regular emoções para decidir melhor',
    'Blindagem é regulação, não repressão nem ausência.', 0),
  (v_m1, 'Qual é um dos três pilares da blindagem emocional?', 'multiple_choice',
    '["Consciência","Isolamento","Negação","Aceleração"]'::jsonb,
    'Consciência',
    'Consciência, regulação e direção são os três pilares.', 1),
  (v_m1, 'A maioria das falhas de execução tem origem:', 'multiple_choice',
    '["Técnica","Financeira","Emocional","Genética"]'::jsonb,
    'Emocional',
    'A maioria das falhas de execução são emocionais.', 2),
  (v_m2, 'O mapa emocional serve para:', 'multiple_choice',
    '["Prever o futuro","Identificar gatilhos e padrões automáticos","Substituir terapia","Eliminar emoções negativas"]'::jsonb,
    'Identificar gatilhos e padrões automáticos',
    'É um inventário consciente dos gatilhos pessoais.', 0),
  (v_m2, 'Qual é o primeiro passo para construir o mapa?', 'multiple_choice',
    '["Meditar por 30 minutos","Listar momentos recentes em que perdeu o controle","Fazer terapia","Ler três livros"]'::jsonb,
    'Listar momentos recentes em que perdeu o controle',
    'Sempre começa pela evidência concreta recente.', 1),
  (v_m2, 'Nomear a emoção primária é importante porque:', 'multiple_choice',
    '["Dá controle e reduz a intensidade","Faz a emoção sumir","Impressiona os outros","Substitui a ação"]'::jsonb,
    'Dá controle e reduz a intensidade',
    'Nomear ativa o córtex pré-frontal e reduz a carga da amígdala.', 2),
  (v_m3, 'A técnica 4-7-8 refere-se a:', 'multiple_choice',
    '["Tempos de respiração: inspirar 4s, segurar 7s, expirar 8s","Horários de refeição","Anos de prática","Repetições de exercício físico"]'::jsonb,
    'Tempos de respiração: inspirar 4s, segurar 7s, expirar 8s',
    'Padrão respiratório clássico para autorregulação rápida.', 0),
  (v_m3, 'O journaling de 3 linhas propõe registrar:', 'multiple_choice',
    '["Sonhos, medos e planos","O que senti, o que aprendi, o que faço diferente amanhã","Metas, tarefas e prazos","Refeições, treinos e sono"]'::jsonb,
    'O que senti, o que aprendi, o que faço diferente amanhã',
    'Objetivo é fechar o dia com consciência e direção.', 1),
  (v_m3, 'A regra dos 90 segundos diz que:', 'multiple_choice',
    '["Toda emoção tem meia-vida de 90s se não for alimentada por pensamento","Você deve tomar decisões em 90 segundos","Emoções duram 90 minutos","90 segundos é o tempo ideal de meditação"]'::jsonb,
    'Toda emoção tem meia-vida de 90s se não for alimentada por pensamento',
    'Base neurofisiológica descrita por Jill Bolte Taylor.', 2),
  (v_m3, 'Quantos dias de prática são recomendados antes do próximo curso?', 'multiple_choice',
    '["1","3","7","30"]'::jsonb,
    '7',
    'Sete dias criam consistência mínima para percepção real.', 3)
  ON CONFLICT DO NOTHING;
END $$;
