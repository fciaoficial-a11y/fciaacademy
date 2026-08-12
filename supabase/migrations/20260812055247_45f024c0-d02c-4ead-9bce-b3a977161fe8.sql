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

    -- 2. Inserir Módulo 4 — Aula 1: O Sistema de Consistência Visual
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 4 — Aula 1: O Sistema de Consistência Visual',
        'sistema-consistencia-visual-ia',
        'Por que a consistência é o requisito mais importante para um influenciador de IA.',
        40, -- 4.0
        'video',
        false,
        'https://example.com/videos/influenciador-m4-a1',
        18,
        '# O Sistema de Consistência Visual\n\nNesta aula, você aprenderá por que a consistência visual é a base da autoridade de um influenciador virtual.\n\n### O que é Consistência Visual?\nÉ a capacidade de gerar o mesmo personagem em diferentes contextos, mantendo o reconhecimento imediato pela audiência.\n\n### Por que Imagens Bonitas Podem Estar Erradas?\nUma imagem tecnicamente perfeita, mas que altera traços faciais ou a idade do influenciador, destrói a narrativa de "realidade" do personagem.\n\n### O Objetivo Final:\nCriar um sistema de identidade que permita variar poses, expressões e ambientes sem perder o rosto original.'
    ) RETURNING id INTO v_module_id;

    -- 3. Inserir Aula 2: A Ficha Técnica Visual (O Manual do Rosto)
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 4 — Aula 2: A Ficha Técnica Visual',
        'ficha-tecnica-visual-influenciador',
        'Documentando cada detalhe físico, desde o formato do rosto até o subtom da pele.',
        41,
        'video',
        false,
        'https://example.com/videos/influenciador-m4-a2',
        25,
        '# A Ficha Técnica Visual\n\nAprenda a documentar a "anatomia" do seu influenciador.\n\n### Elementos da Ficha Técnica:\n- **Rosto**: Formato, testa, mandíbula e queixo.\n- **Pele**: Tom e subtom exatos.\n- **Cabelo**: Corte, textura e brilho.\n- **Corpo**: Postura e linguagem corporal.\n\n### Exemplo Preenchido:\n*Identidade ID-402: Maya, 26 anos, pele quente, rosto oval, olhos amendoados cor avelã, cabelo castanho iluminado estilo messy wave.*'
    );

    -- 4. Inserir Aula 3: Elementos Fixos, Variáveis e Proibidos
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 4 — Aula 3: Elementos Fixos, Variáveis e Proibidos',
        'elementos-fixos-variaveis-proibidos',
        'Definindo o que nunca muda e o que pode ser adaptado no conteúdo.',
        42,
        'video',
        false,
        'https://example.com/videos/influenciador-m4-a3',
        20,
        '# Elementos Fixos, Variáveis e Proibidos\n\nOrganize a identidade em três quadros de controle.\n\n### Quadro 1: Elementos Fixos\nTraços faciais, cor dos olhos, tom de pele e características marcantes (como uma sarda ou o formato da sobrancelha).\n\n### Quadro 2: Elementos Variáveis\nRoupas (dentro da paleta), expressões faciais, ambientes e poses.\n\n### Quadro 3: Elementos Proibidos\nRoupas de cores fora da paleta, acessórios que não combinam com o arquétipo e estilos de iluminação que descaracterizam a pele.'
    );

    -- 5. Inserir Aula 4: Engenharia do Prompt-Base de Identidade
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 4 — Aula 4: Engenharia do Prompt-Base',
        'prompt-base-identidade-influenciador',
        'Como construir o prompt mestre que será a âncora de toda a sua produção.',
        43,
        'video',
        false,
        'https://example.com/videos/influenciador-m4-a4',
        30,
        '# Engenharia do Prompt-Base\n\nO Prompt-Base é o código genético do seu influenciador.\n\n### Estrutura do Prompt-Base:\n1. **Identidade**: Descrição física detalhada.\n2. **Estilo**: Estética fotográfica e qualidade.\n3. **Câmera**: Lentes e enquadramentos padrão.\n4. **Critérios de Validação**: O que a IA deve priorizar.\n\nEnsine a IA que esse prompt é a "verdade absoluta" daquele personagem.'
    );

    -- 6. Inserir Aula 5: A Biblioteca de Identidade e Validação
    INSERT INTO public.modules (
        course_id, title, slug, description, sort_order, content_type, is_published,
        video_url, duration_minutes, content_text
    ) VALUES (
        v_course_id,
        'Módulo 4 — Aula 5: A Biblioteca de Identidade e Validação',
        'biblioteca-identidade-e-validacao',
        'Organizando referências e validando imagens antes da produção de vídeo.',
        44,
        'video',
        false,
        'https://example.com/videos/influenciador-m4-a5',
        22,
        '# A Biblioteca de Identidade e Validação\n\nComo organizar seu fluxo de trabalho profissional.\n\n### Organização de Arquivos:\nCategorize por: Rosto (Close-up), Corpo Inteiro, Roupas Autorizadas e Cenários.\n\n### Checklist de Validação:\n1. O rosto é reconhecível?\n2. A idade aparente mudou?\n3. O tom de pele está correto?\n4. Há falhas de IA (mãos, proporções)?\n\nPrepare essas imagens para servirem de base na produção dos seus vídeos no TikTok.'
    );

    -- 7. Inserir Questões do Quiz no Módulo 4 - Aula 1 (Âncora do quiz do módulo)
    INSERT INTO public.questions (course_id, module_id, question, options, correct_answer, explanation, type, difficulty, status)
    VALUES 
    (v_course_id, v_module_id, 'Qual o objetivo principal da Consistência Visual?', '["Gerar imagens bonitas e variadas", "Manter o reconhecimento imediato do influenciador em todos os conteúdos", "Gastar menos créditos na IA", "Seguir as tendências do dia"]'::jsonb, 'Manter o reconhecimento imediato do influenciador em todos os conteúdos', 'A consistência garante que a audiência identifique o personagem como uma entidade real e confiável.', 'multiple_choice', 'easy', 'approved'),
    (v_course_id, v_module_id, 'O que define um "Elemento Fixo" em uma identidade de IA?', '["Qualquer coisa que o aluno queira", "Características físicas e traços faciais que nunca devem mudar", "Apenas o cenário do vídeo", "O produto que está sendo vendido"]'::jsonb, 'Características físicas e traços faciais que nunca devem mudar', 'Elementos fixos são a âncora da identidade e não podem sofrer variação.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'O que é um "Prompt-Base"?', '["Um prompt simples e curto", "O guia técnico de prompts que serve como âncora de identidade", "Um comando para deletar a imagem", "Um prompt focado apenas no cenário"]'::jsonb, 'O guia técnico de prompts que serve como âncora de identidade', 'O Prompt-Base contém o "DNA" visual do influenciador.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Por que devemos definir "Elementos Proibidos"?', '["Para limitar a criatividade", "Para evitar desvios de identidade e perda de autoridade visual", "Porque a IA não gosta de cores fortes", "Para economizar tempo de geração"]'::jsonb, 'Para evitar desvios de identidade e perda de autoridade visual', 'Proibições claras evitam que a IA gere resultados que descaracterizam o personagem.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Como a "Ficha Técnica Visual" ajuda na produção?', '["Ela serve como um manual de consulta para manter a precisão dos prompts", "Ela serve para postar no TikTok", "Ela serve para escolher o preço do curso", "Ela é apenas um exercício teórico"]'::jsonb, 'Ela serve como um manual de consulta para manter a precisão dos prompts', 'A ficha técnica garante que todos os prompts futuros sigam os mesmos critérios físicos.', 'multiple_choice', 'hard', 'approved'),
    (v_course_id, v_module_id, 'O que compõe a Biblioteca de Identidade?', '["Imagens aleatórias do Pinterest", "Um conjunto organizado de referências validadas do próprio influenciador", "Apenas vídeos do TikTok", "Uma lista de links de sites"]'::jsonb, 'Um conjunto organizado de referências validadas do próprio influenciador', 'A biblioteca fornece a base visual para treinar a consistência em novos conteúdos.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Qual destas é uma falha comum de consistência visual em IA?', '["Mudança no formato do rosto entre duas cenas", "Mudança na iluminação do ambiente", "Mudança na pose do influenciador", "Mudança no produto demonstrado"]'::jsonb, 'Mudança no formato do rosto entre duas cenas', 'Alterações na estrutura facial são o erro mais crítico de consistência.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'O que pode ser considerado um "Elemento Variável"?', '["A cor dos olhos", "As expressões faciais e o enquadramento da câmera", "O formato da mandíbula", "A idade aparente"]'::jsonb, 'As expressões faciais e o enquadramento da câmera', 'Expressões e enquadramentos devem mudar para criar dinamismo sem perder o rosto.', 'multiple_choice', 'easy', 'approved'),
    (v_course_id, v_module_id, 'Qual a importância do Checklist de Validação?', '["Garantir que apenas imagens que respeitem a identidade sejam publicadas", "Para saber se a imagem ficou bonita", "Para contar quantas imagens foram geradas", "Para postar nos comentários"]'::jsonb, 'Garantir que apenas imagens que respeitem a identidade sejam publicadas', 'A validação é o filtro final que protege a qualidade do projeto.', 'multiple_choice', 'medium', 'approved'),
    (v_course_id, v_module_id, 'Como manter a consistência entre imagens e vídeos?', '["Usando prompts aleatórios", "Utilizando a Ficha Técnica e a Biblioteca de Referências validadas", "Mudando o influenciador a cada vídeo", "Não usando prompts detalhados"]'::jsonb, 'Utilizando a Ficha Técnica e a Biblioteca de Referências validadas', 'A combinação de dados técnicos e imagens de referência é a chave da consistência.', 'multiple_choice', 'medium', 'approved');

END $$;
