-- Usar blocos anônimos para evitar erros de permissão se rodar via service_role ou psql direto
DO $$
DECLARE
    v_course_id UUID := 'e23cf598-23be-4dbe-b8f0-4c3a420d9b62';
BEGIN
    -- 1. Remover duplicatas
    DELETE FROM public.modules 
    WHERE course_id = v_course_id 
    AND (title = 'MÓDULO 0 — A Nova Era do Social Commerce' OR slug = 'modulo-0-social-commerce');

    -- 2. Garantir que o Módulo 0 correto tenha a ordem 0
    UPDATE public.modules 
    SET sort_order = 0 
    WHERE course_id = v_course_id 
    AND slug = 'modulo-0-boas-vindas';

    -- 3. Inserir o quiz básico do Módulo 0 para garantir que o 70% funcione (3 perguntas)
    INSERT INTO public.questions (course_id, module_id, question_text, options, correct_option_index, explanation)
    SELECT 
        v_course_id, 
        m.id, 
        q.question, 
        q.options, 
        q.correct, 
        q.explanation
    FROM public.modules m
    CROSS JOIN (
        SELECT 'Qual o principal diferencial de um influenciador de IA em comparação ao humano no TikTok Shop?' as question, 
               ARRAY['Consistência estética e escala global instantânea', 'Capacidade de sentir emoções reais', 'Menor custo de internet'] as options, 
               0 as correct, 
               'A IA permite escala, tradução automática e manutenção de padrão visual sem fadiga.' as explanation
        UNION ALL
        SELECT 'O que define a "alma" de um influenciador virtual?' as question, 
               ARRAY['O número de pixels da imagem', 'A marca, valores e tom de voz', 'O software de edição usado'] as options, 
               1 as correct, 
               'A imagem é o corpo, mas o branding e a personalidade são o que geram conexão.' as explanation
        UNION ALL
        SELECT 'Qual a postura ética recomendada ao usar IA em conteúdos comerciais?' as question, 
               ARRAY['Ocultar o uso de IA para parecer mais real', 'Sinalizar claramente o uso de IA para gerar confiança', 'Não responder se questionado'] as options, 
               1 as correct, 
               'Transparência gera autoridade e confiança no longo prazo.' as explanation
    ) q
    WHERE m.course_id = v_course_id AND m.slug = 'modulo-0-boas-vindas'
    AND NOT EXISTS (SELECT 1 FROM public.questions WHERE module_id = m.id);
END $$;
