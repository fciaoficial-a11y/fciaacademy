-- ============================================================
--  Seed idempotente: curso "Influencer com IA"
--  Corrige o erro 42703 (courses.thumbnail_url não existe).
--  A capa vai EXCLUSIVAMENTE em courses.cover_url para
--  satisfazer o trigger de publicação.
--
--  SEM UPDATE, SEM DELETE, SEM ON CONFLICT DO UPDATE:
--  apenas INSERT condicionado a inexistência do registro.
--  Registros já existentes NÃO são tocados.
-- ============================================================

DO $$
DECLARE
  v_course_id uuid;
  v_cover     text := 'https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=800&auto=format&fit=crop';
  v_track_id  uuid;
BEGIN
  -- Trilha: usa a primeira existente; só cria se a tabela estiver vazia
  SELECT id INTO v_track_id FROM public.tracks ORDER BY created_at NULLS LAST LIMIT 1;

  IF v_track_id IS NULL THEN
    INSERT INTO public.tracks (title, slug, description)
    VALUES ('Influenciador de IA', 'influenciador-de-ia', 'Trilha de formação de influenciadores digitais com IA')
    RETURNING id INTO v_track_id;
  END IF;

  -- Curso: só insere se o slug ainda não existir
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influencer-com-ia';

  IF v_course_id IS NULL THEN
    INSERT INTO public.courses (
      track_id,
      slug,
      title,
      description,
      duration_minutes,
      workload_hours,
      price,
      is_free,
      level,
      cover_url,
      sort_order,
      is_published,
      certificate_enabled,
      allow_pdf_download
    ) VALUES (
      v_track_id,
      'influencer-com-ia',
      'Influencer com IA',
      'Formação completa para criar, escalar e monetizar uma influenciadora digital construída com inteligência artificial — do DNA da persona à escala comercial.',
      300,
      20,
      497.00,
      false,
      'Intermediário',
      v_cover,
      100,
      true,
      true,
      false
    )
    RETURNING id INTO v_course_id;
  END IF;

  -- Módulo 1: só insere se ainda não existir para este curso
  IF NOT EXISTS (SELECT 1 FROM public.modules WHERE course_id = v_course_id AND sort_order = 1) THEN
    INSERT INTO public.modules (course_id, slug, title, content_text, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'influencer-com-ia-m1', 'M1: O DNA da Influenciadora',
     E'# Módulo 1 — O DNA da Influenciadora\n\nNeste módulo você define a identidade profunda da influenciadora: posicionamento, nicho, promessa central, tom de voz e o arquétipo que sustenta a persona ao longo do tempo.\n\n## BLOCO 1 — Posicionamento e nicho\nEscolha um nicho com demanda comprovada e cruze com sua capacidade de produção. O nicho é a interseção entre o que o público compra e o que você consegue entregar com consistência.\n\n## BLOCO 2 — Arquétipo e tom de voz\nDefina três adjetivos que descrevem a persona. Cada adjetivo precisa virar uma decisão concreta de conteúdo: o que ela fala, como fala e o que ela jamais diria.\n\n## BLOCO 3 — Promessa central\nEscreva em uma frase o que a influenciadora entrega. Se não couber em uma frase, ainda é um conjunto de ideias, não um posicionamento.\n\n## PROMPTS\n1. "Descreva uma influenciadora digital do nicho X com arquétipo Y em 120 palavras, incluindo tom de voz e bordões."\n2. "Liste 20 temas de conteúdo que reforcem o posicionamento Z sem repetir formatos."\n\n## ATIVIDADE PRÁTICA\nMonte o documento de DNA da persona com posicionamento, arquétipo, tom de voz e promessa central.\n\n## CHECKLIST\n- [ ] Nicho definido com justificativa de demanda\n- [ ] Três adjetivos de persona traduzidos em decisões de conteúdo\n- [ ] Promessa central em uma frase\n- [ ] Documento de DNA versionado\n\n## RUBRICA DE AVALIAÇÃO\nCoerência entre adjetivos e decisões de conteúdo; clareza da promessa; viabilidade de produção.\n\n## PROJETO\nDocumento de DNA da Influenciadora, pronto para alimentar os módulos seguintes.',
     'text', 45, 1, true);
  END IF;

  -- Módulo 2
  IF NOT EXISTS (SELECT 1 FROM public.modules WHERE course_id = v_course_id AND sort_order = 2) THEN
    INSERT INTO public.modules (course_id, slug, title, content_text, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'influencer-com-ia-m2', 'M2: O Rosto e a Estética',
     E'# Módulo 2 — O Rosto e a Estética\n\nAqui o DNA vira imagem. Você constrói o rosto da influenciadora, padroniza a paleta visual e garante consistência entre todos os materiais.\n\n## BLOCO 1 — Construção do rosto\nDescreva traços, etnia, faixa de idade, tipo de cabelo e detalhes marcantes. Quanto mais específica a descrição, mais estável é o resultado nas ferramentas de geração.\n\n## BLOCO 2 — Paleta e direção de arte\nDefina três cores principais, uma tipografia e uma regra de composição. Toda peça visual nasce dessa regra.\n\n## BLOCO 3 — Consistência entre mídias\nEstabeleça um conjunto de referências fixas para que o rosto permaneça o mesmo no feed, nos stories e nos vídeos.\n\n## PROMPTS\n1. "Retrato realista de mulher de 28 anos, cabelo castanho ondulado, luz suave de janela, fundo neutro, foco nos olhos."\n2. "Mantenha os mesmos traços faciais da referência, altere apenas o cenário para escritório minimalista."\n\n## ATIVIDADE PRÁTICA\nGere cinco variações do rosto e selecione a versão definitiva com base em naturalidade e reprodutibilidade.\n\n## CHECKLIST\n- [ ] Descrição facial completa e versionada\n- [ ] Paleta de três cores definida\n- [ ] Tipografia escolhida\n- [ ] Cinco variações geradas e uma aprovada\n\n## RUBRICA DE AVALIAÇÃO\nNaturalidade do rosto, consistência entre gerações e aderência à paleta.\n\n## PROJETO\nKit visual da influenciadora com rosto aprovado e guia de estilo.',
     'text', 50, 2, true);
  END IF;

  -- Módulo 3
  IF NOT EXISTS (SELECT 1 FROM public.modules WHERE course_id = v_course_id AND sort_order = 3) THEN
    INSERT INTO public.modules (course_id, slug, title, content_text, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'influencer-com-ia-m3', 'M3: O Realismo Cinematográfico',
     E'# Módulo 3 — O Realismo Cinematográfico\n\nO que separa uma imagem gerada de uma foto real é a luz. Neste módulo você aprende a construir iluminação, profundidade e textura com intenção.\n\n## BLOCO 1 — Luz como linguagem\nEstude três esquemas: luz suave de janela, contraluz de fim de tarde e luz dura de estúdio. Cada um muda a emoção da imagem.\n\n## BLOCO 2 — Textura e imperfeição\nPele real tem poros, pequenas assimetrias e variação de tom. Inserir essas características é o que elimina o aspecto plástico.\n\n## BLOCO 3 — Profundidade e lente\nSimule abertura de diafragma, distância focal e desfoque de fundo para dar profundidade cinematográfica.\n\n## PROMPTS\n1. "Foto editorial com luz suave de janela lateral, textura de pele real com poros visíveis, lente 85mm, fundo desfocado."\n2. "Cena noturna com contraluz neon, reflexos na pele, atmosfera cinematográfica, grão fino."\n\n## ATIVIDADE PRÁTICA\nProduza a mesma persona em três esquemas de luz e compare o efeito emocional de cada um.\n\n## CHECKLIST\n- [ ] Três esquemas de luz testados\n- [ ] Textura de pele aplicada\n- [ ] Lente e abertura definidas no prompt\n- [ ] Comparativo emocional registrado\n\n## RUBRICA DE AVALIAÇÃO\nCoerência de luz, naturalidade de textura e impacto emocional.\n\n## PROJETO\nSérie de três imagens cinematográficas da mesma persona.',
     'text', 55, 3, true);
  END IF;

  -- Módulo 4
  IF NOT EXISTS (SELECT 1 FROM public.modules WHERE course_id = v_course_id AND sort_order = 4) THEN
    INSERT INTO public.modules (course_id, slug, title, content_text, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'influencer-com-ia-m4', 'M4: Movimento, Fala e Sincronia Labial',
     E'# Módulo 4 — Movimento, Fala e Sincronia Labial\n\nUma influenciadora estática é um cartaz. Aqui você adiciona movimento, voz e sincronia labial para que ela fale com o público.\n\n## BLOCO 1 — Movimento natural\nEvite movimentos amplos e bruscos. Microexpressões, piscar de olhos e leve inclinação de cabeça criam realismo.\n\n## BLOCO 2 — Voz e entonação\nEscolha uma voz compatível com a persona e mantenha constante para não quebrar a identidade sonora.\n\n## BLOCO 3 — Sincronia labial\nGere o áudio primeiro, depois sincronize o vídeo com frases curtas e pausas naturais.\n\n## PROMPTS\n1. "Vídeo de 10 segundos, plano médio, mulher falando para a câmera com microexpressões naturais, luz suave."\n2. "Mantenha a mesma voz e entonação do vídeo anterior ao gerar a nova fala."\n\n## ATIVIDADE PRÁTICA\nProduza um vídeo de 15 segundos com fala sincronizada e avalie a naturalidade do movimento.\n\n## CHECKLIST\n- [ ] Movimentos sutis definidos\n- [ ] Voz escolhida e documentada\n- [ ] Áudio gerado antes do vídeo\n- [ ] Sincronia labial revisada\n\n## RUBRICA DE AVALIAÇÃO\nNaturalidade de movimento, consistência de voz e precisão da sincronia.\n\n## PROJETO\nVídeo de apresentação da influenciadora com 15 segundos.',
     'text', 60, 4, true);
  END IF;

  -- Módulo 5
  IF NOT EXISTS (SELECT 1 FROM public.modules WHERE course_id = v_course_id AND sort_order = 5) THEN
    INSERT INTO public.modules (course_id, slug, title, content_text, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'influencer-com-ia-m5', 'M5: Escala e Monetização',
     E'# Módulo 5 — Escala e Monetização\n\nO último módulo transforma produção em negócio: processos, equipe e canais de receita.\n\n## BLOCO 1 — Processo de produção\nDocumente o fluxo da ideação à publicação. Processo documentado é o que permite produzir em escala sem perder qualidade.\n\n## BLOCO 2 — Canais de monetização\nCombine afiliação, produtos próprios, conteúdo patrocinado e comunidade paga. Cada canal exige um tipo de conteúdo.\n\n## BLOCO 3 — Métricas que importam\nAcompanhe retenção, taxa de clique e conversão. Vaidade de alcance sem conversão não paga as contas.\n\n## PROMPTS\n1. "Monte um calendário editorial de 30 dias para a persona X, com quatro formatos e quatro canais de monetização."\n2. "Analise os dados de retenção abaixo e proponha três ajustes de conteúdo."\n\n## ATIVIDADE PRÁTICA\nEstruture o calendário de 30 dias e defina a meta de receita por canal.\n\n## CHECKLIST\n- [ ] Fluxo de produção documentado\n- [ ] Quatro canais de monetização ativos\n- [ ] Painel de métricas definido\n- [ ] Meta de receita por canal\n\n## RUBRICA DE AVALIAÇÃO\nViabilidade do calendário, clareza dos canais e coerência das metas.\n\n## PROJETO\nPlano de escala e monetização do primeiro trimestre.',
     'text', 60, 5, true);
  END IF;
END $$;
