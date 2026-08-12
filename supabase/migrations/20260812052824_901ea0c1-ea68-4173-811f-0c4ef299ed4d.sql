DO $$
DECLARE
    v_course_id UUID;
    v_module_id UUID;
BEGIN
    -- Obter o ID do curso Influenciador IA
    SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop';

    IF v_course_id IS NOT NULL THEN
        -- Inserir Módulo 2 na tabela 'modules' (is_published=false conforme diretriz de standby)
        INSERT INTO public.modules (
            course_id,
            slug,
            title,
            description,
            sort_order,
            is_published,
            video_url,
            complementary_content,
            content_text
        ) VALUES (
            v_course_id,
            'modulo-2-estrategia-posicionamento',
            'Módulo 2: Estratégia, Nicho, Público e Posicionamento',
            'Aprenda a tomar decisões estratégicas antes de criar o influenciador virtual: nicho, persona, proposta de valor e tom de voz.',
            2,
            false, -- Mantém standby
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            '### Materiais Complementares\n- Matriz de Posicionamento (PDF)\n- Ficha de Personagem Estratégico\n- Biblioteca de Prompts de Pesquisa de Mercado',
            '# Módulo 2: Estratégia e Posicionamento\n\n## Promessa\nDefinir a base estratégica que garantirá a conversão do seu influenciador virtual no TikTok Shop.\n\n## Introdução\nUm influenciador virtual não é apenas um "personagem bonito". Sem estratégia, ele é apenas ruído visual. Aqui, construímos a alma comercial do projeto.\n\n### 1. Posicionamento vs. Criação Visual\nAntes de abrir o Midjourney ou Leonardo.ai, você precisa saber PARA QUEM está falando. O posicionamento dita a estética, não o contrário.\n\n### 2. Escolha do Nicho\nNão escolha por tendência. Avalie:\n- Volume de problemas demonstráveis.\n- Variedade de produtos.\n- Frequência de compra.\n\n### 3. Público e Persona\nDefina: Quem é o público? Qual a dor central? Por que ele ainda não resolveu esse problema?\n\n### 4. Arquétipos de Venda\n- **Especialista:** Focado em dados e autoridade.\n- **Amigo Confiável:** Focado em proximidade e uso diário.\n- **Descobridor:** Focado em novidades e curiosidade.\n\n### Atividade Prática: Mapa Estratégico\n1. Defina seu nicho e subnicho.\n2. Escolha o arquétipo principal.\n3. Escreva sua Proposta de Valor: "Este influenciador ajuda [PÚBLICO] a [RESULTADO] através de [ABORDAGEM]."'
        ) ON CONFLICT (course_id, slug) DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            content_text = EXCLUDED.content_text,
            is_published = EXCLUDED.is_published
        RETURNING id INTO v_module_id;

        -- Inserir Quiz do Módulo 2
        INSERT INTO public.questions (module_id, course_id, question, type, options, correct_answer, explanation) VALUES
        (v_module_id, v_course_id, 'Qual a principal diferença entre um personagem de IA e um influenciador virtual posicionado?', 'multiple_choice', '["A aparência física", "A função estratégica e comercial", "O software utilizado", "O número de postagens"]', '1', 'Um influenciador virtual possui objetivos comerciais, tom de voz e território de comunicação definidos.'),
        (v_module_id, v_course_id, 'O que deve vir primeiro no fluxo de trabalho profissional?', 'multiple_choice', '["Criação do rosto da IA", "Definição do nicho e posicionamento", "Escolha do nome", "Criação da conta no TikTok"]', '1', 'O posicionamento guia todas as escolhas visuais e de comunicação posteriores.'),
        (v_module_id, v_course_id, 'Qual critério é vital para escolher um nicho no TikTok Shop?', 'multiple_choice', '["Ser o nicho mais famoso", "Produtos que pagam comissão em dólar e são demonstráveis em vídeo", "Ser o nicho com menos concorrência", "Ser o nicho que você mais gosta pessoalmente"]', '1', 'A facilidade de demonstração e o potencial comercial (comissão) são os pilares do lucro.')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;