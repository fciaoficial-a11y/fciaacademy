-- FCIA ACADEMY: PRODUÇÃO DO MÓDULO 3
-- Curso: Influenciador de IA para TikTok Shop
-- Módulo: MÓDULO 3 — CRIAÇÃO DA IDENTIDADE DO INFLUENCIADOR VIRTUAL

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

    -- 2. Inserir Módulo 3
    INSERT INTO public.modules (
        course_id, 
        title, 
        slug, 
        description, 
        order_index, 
        xp_value
    ) VALUES (
        v_course_id,
        'Módulo 3 — Criação da Identidade do Influenciador Virtual',
        'identidade-influenciador-virtual',
        'Aprenda a transformar o posicionamento estratégico em uma identidade completa, coerente e comercialmente poderosa.',
        3,
        250
    ) RETURNING id INTO v_module_id;

    -- 3. Inserir Aulas (5 aulas densas)
    
    -- Aula 1: Fundamentos da Identidade Virtual
    INSERT INTO public.lessons (module_id, title, slug, content, video_url, order_index, duration_minutes)
    VALUES (
        v_module_id,
        'Fundamentos da Identidade Virtual',
        'fundamentos-identidade',
        '# Fundamentos da Identidade Virtual\n\nEntenda a diferença entre Aparência, Personagem, Persona e Marca.\n\n### O que é Identidade?\nA identidade é o que torna seu influenciador único. Ela responde a perguntas como: Quem é ele? Para quem fala? Por que ele existe?\n\n### Diferenças Cruciais:\n- **Personagem**: A casca visual e narrativa.\n- **Persona**: O papel social e a forma como interage.\n- **Marca**: A promessa de valor e a percepção de confiança.\n- **Avatar Comercial**: O veículo para a venda de produtos.',
        'https://example.com/videos/influenciador-m3-a1',
        1,
        15
    );

    -- Aula 2: Arquitetura da Personalidade e Voz
    INSERT INTO public.lessons (module_id, title, slug, content, video_url, order_index, duration_minutes)
    VALUES (
        v_module_id,
        'Arquitetura da Personalidade e Voz',
        'personalidade-e-voz',
        '# Personalidade e Voz\n\nDefina valores, arquétipos e o tom verbal do seu influenciador.\n\n### Escala de Personalidade:\n- **Energia**: Baixa, moderada ou alta.\n- **Humor**: Discreto, leve ou intenso.\n- **Autoridade**: Iniciante ou especialista.\n\n### Identidade Verbal:\nCrie um manual de voz com palavras preferidas, expressões recorrentes e chamadas para ação exclusivas.',
        'https://example.com/videos/influenciador-m3-a2',
        2,
        18
    );

    -- Aula 3: Design da Aparência e Estilo
    INSERT INTO public.lessons (module_id, title, slug, content, video_url, order_index, duration_minutes)
    VALUES (
        v_module_id,
        'Design da Aparência e Estilo',
        'aparencia-e-estilo',
        '# Aparência e Estilo\n\nComo definir características físicas e vestuário que comunicam autoridade e nicho.\n\n### Elementos Visuais:\n- **Físico**: Idade aparente, traços faciais, cabelo.\n- **Vestuário**: Cores principais, tecidos e acessórios fixos.\n- **Consistência**: O segredo está na repetição de elementos-chave.',
        'https://example.com/videos/influenciador-m3-a3',
        3,
        20
    );

    -- Aula 4: Narrativa e Ambientação
    INSERT INTO public.lessons (module_id, title, slug, content, video_url, order_index, duration_minutes)
    VALUES (
        v_module_id,
        'Narrativa e Ambientação',
        'narrativa-e-ambientacao',
        '# Narrativa e Ambientação\n\nA história de origem e os cenários que constroem a realidade do personagem.\n\n### Backstory:\nDe onde ele veio? Quais são suas lutas? Por que ele decidiu ajudar as pessoas?\n\n### Cenários:\nDefina a iluminação, paleta de cores e objetos de apoio que reforçam o nicho.',
        'https://example.com/videos/influenciador-m3-a4',
        4,
        12
    );

    -- Aula 5: A Ficha-Mestra (Master Prompting)
    INSERT INTO public.lessons (module_id, title, slug, content, video_url, order_index, duration_minutes)
    VALUES (
        v_module_id,
        'A Ficha-Mestra (Master Prompting)',
        'ficha-mestra-prompts',
        '# A Ficha-Mestra\n\nTransformando toda a estratégia em um documento técnico de prompts.\n\n### Como Criar:\n1. Reúna todos os dados das aulas anteriores.\n2. Crie a frase de definição central.\n3. Estruture os prompts de aparência, voz e comportamento.\n\nEste é o documento que você usará em todas as ferramentas de IA.',
        'https://example.com/videos/influenciador-m3-a5',
        5,
        25
    );

    -- 4. Inserir Questões do Quiz (10 questões)
    
    INSERT INTO public.questions (course_id, module_id, question, options, correct_answer, explanation, type, difficulty, status)
    VALUES 
    (v_course_id, v_module_id, 'Qual a diferença fundamental entre Personagem e Persona?', '["Personagem é o visual, Persona é o comportamento", "Personagem é o nome, Persona é o rosto", "São a mesma coisa", "Personagem é para vendas, Persona é para entretenimento"]', 'Personagem é o visual, Persona é o comportamento', 'O personagem refere-se à construção visual e física, enquanto a persona é o papel social e comportamental.', 'multiple_choice', 'medium', 'active'),
    (v_course_id, v_module_id, 'O que compõe a Identidade Verbal de um influenciador?', '["Apenas a cor da roupa", "Vocabulário, tom emocional e expressões recorrentes", "O cenário do vídeo", "O número de seguidores"]', 'Vocabulário, tom emocional e expressões recorrentes', 'A identidade verbal define como o influenciador fala e se comunica.', 'multiple_choice', 'medium', 'active'),
    (v_course_id, v_module_id, 'Por que a consistência visual é vital para um influenciador de IA?', '["Para economizar bateria", "Para gerar reconhecimento e confiança na audiência", "Porque a IA só sabe fazer uma imagem", "Para o TikTok não banir a conta"]', 'Para gerar reconhecimento e confiança na audiência', 'A audiência precisa reconhecer o influenciador em cada vídeo para construir autoridade.', 'multiple_choice', 'easy', 'active'),
    (v_course_id, v_module_id, 'O que é a "Ficha-Mestra"?', '["Um documento com a senha das redes sociais", "O guia central de prompts que define toda a identidade", "Uma planilha de gastos", "A biografia do TikTok"]', 'O guia central de prompts que define toda a identidade', 'A ficha-mestra é o documento técnico que traduz a estratégia para a linguagem das IAs.', 'multiple_choice', 'medium', 'active'),
    (v_course_id, v_module_id, 'Como o arquétipo influencia o comportamento do influenciador?', '["Define o valor do curso", "Define o padrão de reações e motivações fundamentais", "Não influencia nada", "Serve apenas para escolher a cor dos olhos"]', 'Define o padrão de reações e motivações fundamentais', 'Arquétipos são modelos de personalidade que orientam como o influenciador age.', 'multiple_choice', 'medium', 'active'),
    (v_course_id, v_module_id, 'Qual critério é importante ao escolher o nome do influenciador?', '["Ser o nome do criador", "Facilidade de pronúncia e compatibilidade com o nicho", "Ter mais de 20 letras", "Ser um nome em outra língua obrigatoriamente"]', 'Facilidade de pronúncia e compatibilidade com o nicho', 'O nome deve ser memorável e fazer sentido para o público-alvo.', 'multiple_choice', 'easy', 'active'),
    (v_course_id, v_module_id, 'O que deve ser evitado ao criar cenários para o influenciador?', '["Mudar o cenário drasticamente sem motivo estratégico", "Usar luz natural", "Ter profundidade na imagem", "Usar cores da paleta definida"]', 'Mudar o cenário drasticamente sem motivo estratégico', 'Mudanças aleatórias quebram a percepção de realidade e continuidade.', 'multiple_choice', 'medium', 'active'),
    (v_course_id, v_module_id, 'Qual o papel da "História de Origem"?', '["Justificar o preço do produto", "Gerar conexão emocional e contexto para a audiência", "Preencher tempo no vídeo", "Apenas para diversão"]', 'Gerar conexão emocional e contexto para a audiência', 'A história de origem dá profundidade humana ao personagem virtual.', 'multiple_choice', 'medium', 'active'),
    (v_course_id, v_module_id, 'Em relação à aparência física, o que é mais importante nos prompts?', '["Mudar a cor dos olhos todo dia", "Descrição objetiva e repetível das características principais", "Usar termos vagos", "Não descrever o rosto"]', 'Descrição objetiva e repetível das características principais', 'A precisão na descrição garante que a IA gere o mesmo personagem consistentemente.', 'multiple_choice', 'hard', 'active'),
    (v_course_id, v_module_id, 'Como definir os limites de comportamento do influenciador?', '["Deixando a IA decidir", "Definindo o que o influenciador NUNCA faria ou falaria", "Não definindo limites", "Seguindo apenas as tendências do dia"]', 'Definindo o que o influenciador NUNCA faria ou falaria', 'Limites claros protegem a integridade da marca e a consistência da narrativa.', 'multiple_choice', 'medium', 'active');

END $$;
