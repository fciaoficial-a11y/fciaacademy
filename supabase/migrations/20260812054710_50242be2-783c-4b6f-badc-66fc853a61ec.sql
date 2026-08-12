DO $$
DECLARE
    v_course_id UUID;
    v_module_id UUID;
BEGIN
    -- 1. Obter ID do curso
    SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop';
    
    IF v_course_id IS NULL THEN
        RAISE EXCEPTION 'Curso influenciador-ia-tiktok-shop não encontrado.';
    END IF;

    -- 2. Inserir Módulo 3 — Aula 1: Fundamentos da Identidade Virtual
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 3 — Aula 1: Fundamentos da Identidade Virtual',
        'fundamentos-identidade-virtual',
        'Entenda a diferença entre Aparência, Personagem, Persona e Marca.',
        30,
        'video',
        false,
        'https://example.com/videos/influenciador-m3-a1',
        15,
        '# Fundamentos da Identidade Virtual\n\nEntenda a diferença entre Aparência, Personagem, Persona e Marca.\n\n### O que é Identidade?\nA identidade é o que torna seu influenciador único. Ela responde a perguntas como: Quem é ele? Para quem fala? Por que ele existe?\n\n### Diferenças Cruciais:\n- **Personagem**: A casca visual e narrativa.\n- **Persona**: O papel social e a forma como interage.\n- **Marca**: A promessa de valor e a percepção de confiança.\n- **Avatar Comercial**: O veículo para a venda de produtos.'
    ) RETURNING id INTO v_module_id;

    -- 3. Inserir Aula 2: Arquitetura da Personalidade e Voz
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 3 — Aula 2: Arquitetura da Personalidade e Voz',
        'personalidade-e-voz-influenciador',
        'Defina valores, arquétipos e o tom verbal do seu influenciador.',
        31,
        'video',
        false,
        'https://example.com/videos/influenciador-m3-a2',
        18,
        '# Personalidade e Voz\n\nDefina valores, arquétipos e o tom verbal do seu influenciador.\n\n### Escala de Personalidade:\n- **Energia**: Baixa, moderada ou alta.\n- **Humor**: Discreto, leve ou intenso.\n- **Autoridade**: Iniciante ou especialista.\n\n### Identidade Verbal:\nCrie um manual de voz com palavras preferidas, expressões recorrentes e chamadas para ação exclusivas.'
    );

    -- 4. Inserir Aula 3: Design da Aparência e Estilo
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 3 — Aula 3: Design da Aparência e Estilo',
        'aparencia-e-estilo-influenciador',
        'Como definir características físicas e vestuário que comunicam autoridade.',
        32,
        'video',
        false,
        'https://example.com/videos/influenciador-m3-a3',
        20,
        '# Aparência e Estilo\n\nComo definir características físicas e vestuário que comunicam autoridade e nicho.\n\n### Elementos Visuais:\n- **Físico**: Idade aparente, traços faciais, cabelo.\n- **Vestuário**: Cores principais, tecidos e acessórios fixos.\n- **Consistência**: O segredo está na repetição de elementos-chave.'
    );

    -- 5. Inserir Aula 4: Narrativa e Ambientação
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 3 — Aula 4: Narrativa e Ambientação',
        'narrativa-e-ambientacao-influenciador',
        'A história de origem e os cenários que constroem a realidade do personagem.',
        33,
        'video',
        false,
        'https://example.com/videos/influenciador-m3-a4',
        12,
        '# Narrativa e Ambientação\n\nA história de origem e os cenários que constroem a realidade do personagem.\n\n### Backstory:\nDe onde ele veio? Quais são suas lutas? Por que ele decidiu ajudar as pessoas?\n\n### Cenários:\nDefina a iluminação, paleta de cores e objetos de apoio que reforçam o nicho.'
    );

    -- 6. Inserir Aula 5: A Ficha-Mestra (Master Prompting)
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 3 — Aula 5: A Ficha-Mestra (Master Prompting)',
        'ficha-mestra-prompts-influenciador',
        'Transformando toda a estratégia em um documento técnico de prompts.',
        34,
        'video',
        false,
        'https://example.com/videos/influenciador-m3-a5',
        25,
        '# A Ficha-Mestra\n\nTransformando toda a estratégia em um documento técnico de prompts.\n\n### Como Criar:\n1. Reúna todos os dados das aulas anteriores.\n2. Crie a frase de definição central.\n3. Estruture os prompts de aparência, voz e comportamento.\n\nEste é o documento que você usará em todas as ferramentas de IA.'
    );

    -- 7. Inserir Questões do Quiz no Módulo 3 - Aula 1
    INSERT INTO public.questions (course_id, module_id, question, options, correct_answer, explanation, type, difficulty, status)
    VALUES 
    (v_course_id, v_module_id, 'Qual a diferença fundamental entre Personagem e Persona?', '["Personagem é o visual, Persona é o comportamento", "Personagem é o nome, Persona é o rosto", "São a mesma coisa", "Personagem é para vendas, Persona é para entretenimento"]'::jsonb, 'Personagem é o visual, Persona é o comportamento', 'O personagem refere-se à construção visual e física, enquanto a persona é o papel social e comportamental.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'O que compõe a Identidade Verbal de um influenciador?', '["Apenas a cor da roupa", "Vocabulário, tom emocional e expressões recorrentes", "O cenário do vídeo", "O número de seguidores"]'::jsonb, 'Vocabulário, tom emocional e expressões recorrentes', 'A identidade verbal define como o influenciador fala e se comunica.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Por que a consistência visual é vital para um influenciador de IA?', '["Para economizar bateria", "Para gerar reconhecimento e confiança na audiência", "Porque a IA só sabe fazer uma imagem", "Para o TikTok não banir a conta"]'::jsonb, 'Para gerar reconhecimento e confiança na audiência', 'A audiência precisa reconhecer o influenciador em cada vídeo para construir autoridade.', 'multiple_choice', 'easy', 'approved'),
    (v_course_id, v_module_id, 'O que é a "Ficha-Mestra"?', '["Um documento com a senha das redes sociais", "O guia central de prompts que define toda a identidade", "Uma planilha de gastos", "A biografia do TikTok"]'::jsonb, 'O guia central de prompts que define toda a identidade', 'A ficha-mestra é o documento técnico que traduz a estratégia para a linguagem das IAs.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Como o arquétipo influencia o comportamento do influenciador?', '["Define o valor do curso", "Define o padrão de reações e motivações fundamentais", "Não influencia nada", "Serve apenas para escolher a cor dos olhos"]'::jsonb, 'Define o padrão de reações e motivações fundamentais', 'Arquétipos são modelos de personalidade que orientam como o influenciador age.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Qual critério é importante ao escolher o nome do influenciador?', '["Ser o nome do criador", "Facilidade de pronúncia e compatibilidade com o nicho", "Ter mais de 20 letras", "Ser um nome em outra língua obrigatoriamente"]'::jsonb, 'Facilidade de pronúncia e compatibilidade com o nicho', 'O nome deve ser memorável e fazer sentido para o público-alvo.', 'multiple_choice', 'easy', 'approved'),
    (v_course_id, v_module_id, 'O que deve ser evitado ao criar cenários para o influenciador?', '["Mudar o cenário drasticamente sem motivo estratégico", "Usar luz natural", "Ter profundidade na imagem", "Usar cores da paleta definida"]'::jsonb, 'Mudar o cenário drasticamente sem motivo estratégico', 'Mudanças aleatórias quebram a percepção de realidade e continuidade.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Qual o papel da "História de Origem"?', '["Justificar o preço do produto", "Gerar conexão emocional e contexto para a audiência", "Preencher tempo no vídeo", "Apenas para diversão"]'::jsonb, 'Gerar conexão emocional e contexto para a audiência', 'A história de origem dá profundidade humana ao personagem virtual.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Em relação à aparência física, o que é mais importante nos prompts?', '["Mudar a cor dos olhos todo dia", "Descrição objetiva e repetível das características principais", "Usar termos vagos", "Não descrever o rosto"]'::jsonb, 'Descrição objetiva e repetível das características principais', 'A precisão na descrição garante que a IA gere o mesmo personagem consistentemente.', 'multiple_choice', 'hard', 'approved'),
    (v_course_id, v_module_id, 'Como definir os limites de comportamento do influenciador?', '["Deixando a IA decidir", "Definindo o que o influenciador NUNCA faria ou falaria", "Não definindo limites", "Seguindo apenas as tendências do dia"]'::jsonb, 'Definindo o que o influenciador NUNCA faria ou falaria', 'Limites claros protegem a integridade da marca e a consistência da narrativa.', 'multiple_choice', 'medium', 'approved');

END $$;
