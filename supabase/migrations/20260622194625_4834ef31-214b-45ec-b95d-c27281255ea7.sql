
-- Questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice','true_false')),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_module ON public.questions(module_id);

GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view questions"
  ON public.questions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage questions"
  ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  passed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user_module ON public.quiz_attempts(user_id, module_id);

GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own attempts"
  ON public.quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attempts"
  ON public.quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed sample questions for each existing module
INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanation, sort_order)
SELECT m.id,
       'Qual é o principal objetivo do módulo "' || m.title || '"?',
       'multiple_choice',
       '["Apresentar conceitos fundamentais","Vender um produto","Distrair o aluno","Nenhuma das opções"]'::jsonb,
       'Apresentar conceitos fundamentais',
       'Cada módulo introduz e aprofunda conceitos essenciais para a sua trilha de aprendizado.',
       1
FROM public.modules m;

INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanation, sort_order)
SELECT m.id,
       'A prática constante acelera o aprendizado.',
       'true_false',
       '["Verdadeiro","Falso"]'::jsonb,
       'Verdadeiro',
       'A repetição e prática deliberada são pilares do aprendizado efetivo.',
       2
FROM public.modules m;

INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanation, sort_order)
SELECT m.id,
       'Qual atitude favorece a conclusão de um curso online?',
       'multiple_choice',
       '["Estudar com regularidade","Pular todos os módulos","Ignorar exercícios","Não revisar o conteúdo"]'::jsonb,
       'Estudar com regularidade',
       'Constância na rotina de estudos é o fator mais relevante para a conclusão.',
       3
FROM public.modules m;
