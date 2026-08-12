DO $$
DECLARE
    v_course_id UUID;
    v_module_id UUID;
BEGIN
    -- Obter o ID do curso Influenciador IA
    SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop';

    IF v_course_id IS NOT NULL THEN
        -- Inserir Módulo 1
        INSERT INTO public.modules (
            course_id,
            slug,
            title,
            description,
            sort_order,
            is_published,
            quiz_threshold
        ) VALUES (
            v_course_id,
            'modulo-1-mentalidade-e-nichos',
            'Módulo 1: Mentalidade e Nichos Lucrativos',
            'O alicerce estratégico para construir um negócio de Influência com IA que realmente gera dinheiro.',
            1,
            true,
            70
        ) ON CONFLICT (course_id, slug) DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description
        RETURNING id INTO v_module_id;

        -- Inserir Aulas do Módulo 1
        INSERT INTO public.lessons (module_id, title, description, video_url, sort_order) VALUES
        (v_module_id, 'A Mente do Creator 2.0', 'Como transicionar de um espectador para um dono de império digital usando IA.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
        (v_module_id, 'Nichos que Pagam em Dólar e Euro', 'Mapeamento de sub-nichos no TikTok Shop com alta demanda e baixa concorrência.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
        (v_module_id, 'Análise de Concorrência Invisível', 'Como usar ferramentas de IA para espionar o que está funcionando agora sem ser detectado.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3)
        ON CONFLICT DO NOTHING;

        -- Inserir Quiz do Módulo 1
        INSERT INTO public.quizzes (module_id, question, options, correct_answer) VALUES
        (v_module_id, 'Qual é o principal diferencial de um Influenciador de IA no TikTok Shop?', '["Escalabilidade sem mostrar o rosto", "Gastar mais em anúncios", "Ter milhões de seguidores", "Fazer dancinhas"]', 0),
        (v_module_id, 'Por que focar em nichos que pagam em dólar?', '["Pelo poder de compra da moeda e alcance global", "Porque o Real não vale nada", "Porque o TikTok só funciona nos EUA", "Porque é mais fácil gravar"]', 0)
        ON CONFLICT DO NOTHING;
        
        -- Atualizar a capa do curso
        UPDATE public.courses 
        SET cover_url = 'https://images.lexica.art/full_webp/043e62f4-718e-4b46-9d33-4f934277c185'
        WHERE id = v_course_id;
    END IF;
END $$;
