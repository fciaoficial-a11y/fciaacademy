DO $$
DECLARE
    v_course_id UUID;
    v_module_id UUID;
BEGIN
    -- Obter o ID do curso Influenciador IA
    SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop';

    IF v_course_id IS NOT NULL THEN
        -- Inserir Módulo 1 na tabela 'modules'
        INSERT INTO public.modules (
            course_id,
            slug,
            title,
            description,
            sort_order,
            is_published,
            video_url,
            complementary_content
        ) VALUES (
            v_course_id,
            'modulo-1-mentalidade-e-nichos',
            'Módulo 1: Mentalidade e Nichos Lucrativos',
            'O alicerce estratégico para construir um negócio de Influência com IA que realmente gera dinheiro.',
            1,
            true,
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'Este módulo foca na transição de mentalidade e na identificação de nichos de alta conversão.'
        ) ON CONFLICT (course_id, slug) DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            complementary_content = EXCLUDED.complementary_content
        RETURNING id INTO v_module_id;

        -- Inserir Quiz do Módulo 1 na tabela 'questions'
        -- Colunas: module_id, question, type, options, correct_answer, course_id
        INSERT INTO public.questions (module_id, course_id, question, type, options, correct_answer) VALUES
        (v_module_id, v_course_id, 'Qual é o principal diferencial de um Influenciador de IA no TikTok Shop?', 'multiple_choice', '["Escalabilidade sem mostrar o rosto", "Gastar mais em anúncios", "Ter milhões de seguidores", "Fazer dancinhas"]', '0'),
        (v_module_id, v_course_id, 'Por que focar em nichos que pagam em dólar?', 'multiple_choice', '["Pelo poder de compra da moeda e alcance global", "Porque o Real não vale nada", "Porque o TikTok só funciona nos EUA", "Porque é mais fácil gravar"]', '0')
        ON CONFLICT DO NOTHING;
        
        -- Atualizar a capa do curso
        UPDATE public.courses 
        SET cover_url = 'https://images.lexica.art/full_webp/043e62f4-718e-4b46-9d33-4f934277c185'
        WHERE id = v_course_id;
    END IF;
END $$;