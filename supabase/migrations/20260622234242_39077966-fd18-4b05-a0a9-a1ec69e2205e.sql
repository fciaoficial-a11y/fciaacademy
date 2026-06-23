
-- 1) Auto-promote specific email to admin on signup
CREATE OR REPLACE FUNCTION public.auto_promote_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'blindadoemotivado@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_promote_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_promote_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'blindadoemotivado@gmail.com'
ON CONFLICT DO NOTHING;

-- 2) Seed demo data (idempotent: wipe demo slugs first)
DELETE FROM public.questions WHERE module_id IN (
  SELECT m.id FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'curso-demo-e2e'
);
DELETE FROM public.modules WHERE course_id IN (SELECT id FROM public.courses WHERE slug = 'curso-demo-e2e');
DELETE FROM public.courses WHERE slug = 'curso-demo-e2e';
DELETE FROM public.tracks WHERE slug = 'trilha-demo-e2e';

DO $seed$
DECLARE
  v_track_id UUID;
  v_course_id UUID;
  v_module_id UUID;
  v_video TEXT := 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  v_pdf   TEXT := 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  i INT;
  titles TEXT[] := ARRAY[
    'Introdução à Plataforma',
    'Conceitos Fundamentais',
    'Práticas Essenciais',
    'Aplicações Avançadas',
    'Projeto Final e Avaliação'
  ];
BEGIN
  INSERT INTO public.tracks (slug, title, description, tag, level, hours, modules, icon, outcomes, sort_order, is_published, required_plan)
  VALUES ('trilha-demo-e2e', 'Trilha Demo E2E', 'Trilha de demonstração para testes ponta a ponta.', 'Demo', 'Iniciante', '5h', 5, 'Sparkles',
          ARRAY['Validar fluxo completo','Testar quizzes','Testar emissão de certificado'], 999, true, 'free')
  RETURNING id INTO v_track_id;

  INSERT INTO public.courses (track_id, slug, title, description, duration_minutes, level, sort_order, is_published)
  VALUES (v_track_id, 'curso-demo-e2e', 'Curso Demo E2E', 'Curso completo para testes end-to-end com vídeo, PDF e quiz.', 300, 'Iniciante', 1, true)
  RETURNING id INTO v_course_id;

  FOR i IN 1..5 LOOP
    INSERT INTO public.modules (course_id, slug, title, description, content_type, content_url, video_url, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'modulo-demo-' || i, 'Módulo ' || i || ' — ' || titles[i],
            'Módulo demonstrativo ' || i || ' com vídeo, PDF e quiz integrados.',
            'video', v_pdf, v_video, 30, i, true)
    RETURNING id INTO v_module_id;

    INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanation, sort_order) VALUES
    (v_module_id, 'Qual o principal objetivo do Módulo ' || i || '?', 'multiple_choice',
       '["Demonstrar funcionalidades","Vender produtos","Confundir o aluno","Nenhuma das anteriores"]'::jsonb,
       'Demonstrar funcionalidades', 'Este módulo serve para demonstração end-to-end.', 1),
    (v_module_id, 'Quais formatos de conteúdo este módulo apresenta?', 'multiple_choice',
       '["Apenas vídeo","Apenas PDF","Vídeo, PDF e quiz","Apenas quiz"]'::jsonb,
       'Vídeo, PDF e quiz', 'Cada módulo demo contém vídeo, PDF e quiz.', 2),
    (v_module_id, 'A FCIA Academy utiliza qual backend?', 'multiple_choice',
       '["Firebase","Lovable Cloud","AWS RDS","Nenhum"]'::jsonb,
       'Lovable Cloud', 'A FCIA Academy utiliza Lovable Cloud.', 3);
  END LOOP;
END
$seed$;
