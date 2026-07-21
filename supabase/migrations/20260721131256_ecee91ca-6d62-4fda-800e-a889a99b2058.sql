-- Curso Mestre: IA Sem Mistério (retry)
DO $$
DECLARE
  v_course_id uuid;
  v_track_id uuid := '12ec915f-ad6c-4537-9891-f67b67982eec';
  v_module_ids uuid[] := ARRAY[]::uuid[];
  v_mid uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'ia-sem-misterio';
  IF v_course_id IS NULL THEN
    INSERT INTO public.courses (slug, title, description, level, duration_minutes, workload_hours, track_id, price, is_published, certificate_enabled, allow_pdf_download, sort_order)
    VALUES ('ia-sem-misterio','IA Sem Mistério','Curso mestre da FCIA Academy: aprenda a usar IA para criar, comunicar, divulgar, vender e se posicionar com clareza — sem virar programador.','Iniciante',180,3,v_track_id,0,true,true,true,1)
    RETURNING id INTO v_course_id;
  ELSE
    UPDATE public.courses SET title='IA Sem Mistério', description='Curso mestre da FCIA Academy: aprenda a usar IA para criar, comunicar, divulgar, vender e se posicionar com clareza — sem virar programador.', level='Iniciante', duration_minutes=180, workload_hours=3, track_id=v_track_id, price=0, is_published=true, certificate_enabled=true, allow_pdf_download=true, updated_at=now() WHERE id=v_course_id;
  END IF;
  DELETE FROM public.questions WHERE course_id = v_course_id;
  DELETE FROM public.modules WHERE course_id = v_course_id;

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published) VALUES (v_course_id, 'ia-sem-misterio', 'IA sem Mistério', 'Entenda de vez o que é IA, o que ela faz bem, o que ela não faz e como usar sem medo.', 'text',
$md$## Objetivo do módulo

Compreender de forma simples e prática o que é Inteligência Artificial, o que ela realmente entrega hoje e como começar a usar sem travar.

## Abertura

IA não é um monstro tecnológico, nem uma fórmula mágica. É uma ferramenta poderosa que, bem usada, acelera o seu trabalho, sua criatividade e o seu negócio. Este módulo tira o mistério e coloca você no controle.

## Conteúdo principal

### O que é IA, sem enrolar

Inteligência Artificial é software que aprende padrões a partir de dados e produz respostas úteis — texto, imagem, análise, código. Você conversa em linguagem natural, ela responde. Ponto.

### O que a IA faz muito bem hoje

Escrever, resumir, traduzir, criar imagens, gerar ideias, organizar informação, planejar, comparar, revisar e apoiar decisões. Ela é excelente em tarefas repetitivas e criativas de baixo risco.

![IA sem Mistério](/__l5e/assets-v1/61b8df24-1469-4019-a69e-15cd293b84ef/ia-m1.jpg)

### O que a IA ainda não faz

Ela não tem experiência de vida, não sente o cliente na frente e não substitui o seu julgamento. Sem contexto claro, ela chuta. Sem revisão sua, ela erra bonito.

### As ferramentas que importam agora

**GPT** e **Claude** para conversar, escrever e analisar. **Gemini** e **Perplexity** para pesquisa com fontes. **Gamma** para apresentações. **Midjourney** e ferramentas de vídeo IA para criação visual.

## Destaques práticos

- IA é ferramenta, não oráculo — quem pensa é você.
- Contexto claro gera resposta clara.
- Comece por uma tarefa chata do seu dia.

## Aplicação real

Escolha **uma** tarefa repetitiva que consome seu tempo (responder mensagem padrão, resumir reunião, escrever legenda) e delegue para a IA ainda hoje. Meça quanto tempo economizou.

---

_FCIA Academy_$md$, 20, 1, true) RETURNING id INTO v_mid;
  v_module_ids := array_append(v_module_ids, v_mid);

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published) VALUES (v_course_id, 'criacao-que-chama-atencao', 'Criação que Chama Atenção', 'Use IA para criar imagens, capas, roteiros e materiais visuais que param o dedo do seu público.', 'text',
$md$## Objetivo do módulo

Aprender a produzir conteúdo visual e textual atraente com IA, sem depender de designer ou copywriter para começar.

## Abertura

Atenção é a moeda mais cara do mundo digital. Neste módulo você aprende a criar peças que chamam o olho e prendem no primeiro segundo — usando ferramentas simples e princípios que funcionam sempre.

## Conteúdo principal

### A regra do primeiro segundo

Nos primeiros 3 segundos o público decide se fica ou passa. Trabalhe capa, primeira frase e primeira imagem como se fossem o produto inteiro.

### Roteiros e legendas com IA

Peça à IA um roteiro em blocos: **gancho → promessa → conteúdo → chamada**. Reescreva de 3 formas diferentes e escolha a que soa mais como você.

![Criação que Chama Atenção](/__l5e/assets-v1/7b63496c-4ff3-49f0-a847-e76736c00b4c/ia-m2.jpg)

### Imagens que dizem algo

Descreva à IA de imagem o **assunto**, o **estilo**, a **luz** e a **emoção**. Fuja de banco de imagens genérico — imagem certa comunica sozinha.

### Capas e miniaturas que convertem

Contraste forte, um único foco, texto curto e leitura em 2 segundos. Teste 3 versões antes de publicar. A que vencer é a próxima referência.

## Destaques práticos

- Gancho fraco mata bom conteúdo.
- Uma peça, uma ideia. Sempre.
- Teste, meça, repita o que funciona.

## Aplicação real

Escolha uma publicação sua da última semana e refaça capa + primeira frase com IA. Publique de novo e compare o alcance.

---

_FCIA Academy_$md$, 20, 2, true) RETURNING id INTO v_mid;
  v_module_ids := array_append(v_module_ids, v_mid);

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published) VALUES (v_course_id, 'conteudo-que-conecta', 'Conteúdo que Conecta', 'Escreva textos, roteiros e mensagens que soam humanas, geram identificação e criam relacionamento.', 'text',
$md$## Objetivo do módulo

Produzir conteúdo com IA que soa autêntico, gera identificação e transforma seguidor em cliente.

## Abertura

Conteúdo que conecta não é o mais bonito, é o que a pessoa lê e pensa: 'isso é sobre mim'. Aqui você aprende a usar IA como parceira de escrita sem perder a sua voz.

## Conteúdo principal

### A dor antes da solução

Todo conteúdo forte começa nomeando uma dor real do público. Peça à IA para listar 10 dores do seu cliente antes de qualquer texto.

### A voz é sua, o rascunho é da IA

IA acelera, você humaniza. Escreva 3 frases suas no topo do prompt para ela imitar o seu tom. O resultado passa a soar você.

![Conteúdo que Conecta](/__l5e/assets-v1/0f9dfdb9-9e04-4d88-b5c2-a0cbc8af1ada/ia-m3.jpg)

### A estrutura que funciona sempre

**Dor → História → Virada → Aprendizado → Chamada.** Aplique essa espinha em posts, reels, e-mails e vídeos. Muda o tema, não a estrutura.

### Prova social vale mais que promessa

Peça à IA para transformar depoimentos em micro-histórias. Cliente falando por você vende mais que você falando de você.

## Destaques práticos

- Fale com uma pessoa, não com uma multidão.
- Emoção primeiro, argumento depois.
- Toda peça precisa de uma chamada clara.

## Aplicação real

Pegue um depoimento de cliente e peça à IA para transformar em um post no formato Dor → História → Virada. Publique com o nome do cliente.

---

_FCIA Academy_$md$, 20, 3, true) RETURNING id INTO v_mid;
  v_module_ids := array_append(v_module_ids, v_mid);

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published) VALUES (v_course_id, 'divulgacao-que-aparece', 'Divulgação que Aparece', 'Multiplique o alcance do seu conteúdo com IA sem virar refém de anúncio pago.', 'text',
$md$## Objetivo do módulo

Estruturar uma divulgação inteligente que aumenta alcance orgânico, aproveita cada peça criada e evita depender só de tráfego pago.

## Abertura

Criar conteúdo bom e ninguém ver é o pior desperdício. Neste módulo você aprende a fazer o seu conteúdo trabalhar em vários lugares ao mesmo tempo, com apoio da IA.

## Conteúdo principal

### Um conteúdo, dez formatos

Uma ideia vira post, carrossel, reel, story, e-mail e roteiro. Peça à IA para reformatar sem repetir tom. Você triplica alcance sem triplicar trabalho.

### A régua da recorrência

Aparecer uma vez não posiciona. **Frequência + coerência = presença.** Combine com IA um calendário simples de 4 semanas por tema.

![Divulgação que Aparece](/__l5e/assets-v1/dd070a47-ab19-4107-a78d-4cc2f91f4511/ia-m4.jpg)

### SEO e busca com IA

Use **Perplexity** e **Gemini** para descobrir o que o seu público realmente pergunta. Responda essas perguntas em texto e vídeo — o algoritmo entrega.

### Colaboração e menção

IA ajuda a mapear parceiros, roteirizar convites e sugerir pautas em conjunto. Alcance emprestado é o mais barato que existe.

## Destaques práticos

- Um conteúdo bom merece 5 formatos.
- Constância vence viralização.
- Quem responde perguntas do público aparece sozinho.

## Aplicação real

Escolha o seu melhor conteúdo do último mês. Use IA para gerar 5 formatos derivados dele e publique 1 por dia.

---

_FCIA Academy_$md$, 20, 4, true) RETURNING id INTO v_mid;
  v_module_ids := array_append(v_module_ids, v_mid);

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published) VALUES (v_course_id, 'venda-com-ia', 'Venda com IA', 'Estruture ofertas, argumentos e atendimento que convertem, com IA fazendo o trabalho pesado.', 'text',
$md$## Objetivo do módulo

Usar IA para construir ofertas claras, roteiros de venda persuasivos e atendimento consistente que fecha mais.

## Abertura

Vender não é empurrar, é ajudar a decidir. IA bem usada acelera cada etapa: entender o cliente, montar a oferta, responder objeções e conduzir o fechamento com clareza.

## Conteúdo principal

### A oferta antes do argumento

Peça à IA para transformar seu produto em uma **promessa clara + prova + preço + prazo**. Se não couber em 3 linhas, a oferta ainda não está pronta.

### Roteiro de venda em 5 passos

**Conexão → Diagnóstico → Solução → Prova → Fechamento.** Treine com IA simulando o cliente. Você entra na conversa real muito mais afiado.

![Venda com IA](/__l5e/assets-v1/ae4fff17-77a6-4e7a-ae0d-46c1e2603af9/ia-m5.jpg)

### Objeções mapeadas com IA

Peça à IA para listar as 10 objeções mais comuns do seu público. Escreva uma resposta curta para cada. Você para de improvisar.

### Atendimento sem gargalo

Modelos prontos de mensagem para **primeiro contato**, **envio de proposta**, **follow-up** e **pós-venda**. IA gera, você personaliza. Rapidez com carinho.

## Destaques práticos

- Oferta clara vende sozinha.
- Objeção prevista é objeção resolvida.
- Follow-up é onde a maioria das vendas acontece.

## Aplicação real

Escreva sua oferta em 3 linhas com apoio da IA e mande hoje para 5 pessoas que já demonstraram interesse. Anote as respostas.

---

_FCIA Academy_$md$, 20, 5, true) RETURNING id INTO v_mid;
  v_module_ids := array_append(v_module_ids, v_mid);

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published) VALUES (v_course_id, 'marca-que-fica-na-mente', 'Marca que Fica na Mente', 'Construa um posicionamento claro, coerente e memorável usando IA como espelho estratégico.', 'text',
$md$## Objetivo do módulo

Definir um posicionamento de marca simples, coerente e reconhecível — com identidade visual, discurso e presença alinhados.

## Abertura

Marca não é logo — é a lembrança que você deixa. Neste módulo você usa IA para clarear o que você entrega, para quem, com qual promessa e com qual estética.

## Conteúdo principal

### Posicionamento em uma frase

Peça à IA para condensar sua marca em: **eu ajudo [público] a [transformação] através de [método]**. Se soar genérico, refine até doer de específico.

### Identidade visual coerente

Defina 2 cores principais, 1 fonte, 1 tipo de imagem. IA gera moodboard e testes. Consistência visual gera reconhecimento em 3 exposições.

![Marca que Fica na Mente](/__l5e/assets-v1/2ea4250a-996f-45cf-8696-9e550fedf7c9/ia-m6.jpg)

### Tom de voz próprio

Liste 5 palavras que você usa e 5 que você nunca usaria. Peça à IA para respeitar essa régua. Seu texto começa a soar inconfundível.

### Presença que se lembra

Repita **temas**, **frases-âncora** e **rituais** (uma coluna semanal, um bordão, um formato fixo). Repetição estratégica é o que fixa marca.

## Destaques práticos

- Marca clara é marca escolhida.
- Coerência supera perfeição.
- Uma frase-âncora vale por mil posts soltos.

## Aplicação real

Escreva a frase de posicionamento da sua marca em uma linha. Coloque na bio, no e-mail e no perfil profissional ainda hoje.

---

_FCIA Academy_$md$, 20, 6, true) RETURNING id INTO v_mid;
  v_module_ids := array_append(v_module_ids, v_mid);

  INSERT INTO public.modules (course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published) VALUES (v_course_id, 'ideias-em-acao', 'Ideias em Ação', 'Transforme tudo o que aprendeu em um plano executável de 30 dias com apoio da IA.', 'text',
$md$## Objetivo do módulo

Consolidar o curso em um plano prático de 30 dias, com metas claras, entregas semanais e uso disciplinado da IA como aceleradora.

## Abertura

Curso sem ação vira entretenimento. Aqui você fecha a jornada com um plano real, curto e possível — para que a próxima semana seja diferente da última.

## Conteúdo principal

### A regra do próximo passo

Escolha **um** resultado para 30 dias: mais leads, mais vendas, mais alcance, novo produto. Um só. Peça à IA para desenhar o caminho até ele.

### Rotina mínima com IA

Reserve **30 minutos por dia**: 10 criando, 10 divulgando, 10 respondendo. IA acelera cada bloco. Consistência bate talento sempre.

![Ideias em Ação](/__l5e/assets-v1/ae3a3a37-3172-4c35-ad0e-4f0f77d80cb9/ia-m7.jpg)

### Métricas que importam

Meça 3 coisas: **alcance**, **conversas** e **vendas**. Semanalmente. Peça à IA para revisar os números e sugerir ajustes.

### O que fazer quando travar

Volte ao objetivo, encurte o passo e peça à IA um único movimento pequeno para hoje. Movimento gera clareza; espera gera dúvida.

## Destaques práticos

- Um objetivo, 30 dias, 3 métricas.
- 30 minutos por dia mudam um trimestre.
- Ação pequena consistente vence plano perfeito parado.

## Aplicação real

Abra a IA agora e escreva: 'meu objetivo dos próximos 30 dias é X. Me dê um plano semanal com 4 semanas.' Salve o resultado e comece amanhã.

---

_FCIA Academy_$md$, 20, 7, true) RETURNING id INTO v_mid;
  v_module_ids := array_append(v_module_ids, v_mid);

  INSERT INTO public.questions (module_id, course_id, question, type, options, correct_answer, explanation, difficulty, topic, source_type, status, sort_order) VALUES
   (v_module_ids[1], v_course_id, 'O que melhor descreve o que é Inteligência Artificial hoje?', 'multiple_choice', '["Um software que aprende padrões a partir de dados e gera respostas úteis","Uma máquina consciente que pensa como humano","Um banco de dados fixo com regras","Um sensor que percebe o ambiente"]'::jsonb, 'Um software que aprende padrões a partir de dados e gera respostas úteis', 'IA hoje é software estatístico que aprende com dados — não consciência.', 'medium', 'ia sem misterio', 'manual', 'approved', 0),
   (v_module_ids[1], v_course_id, 'Qual é uma limitação real da IA hoje?', 'multiple_choice', '["Ela não substitui o seu julgamento e experiência","Ela nunca erra","Ela lê a mente do cliente","Ela funciona sem contexto"]'::jsonb, 'Ela não substitui o seu julgamento e experiência', 'IA sem contexto e sem revisão humana falha — o julgamento continua sendo seu.', 'medium', 'ia sem misterio', 'manual', 'approved', 0),
   (v_module_ids[1], v_course_id, 'Por onde é melhor começar a usar IA no dia a dia?', 'multiple_choice', '["Por uma tarefa repetitiva que consome tempo","Por um projeto complexo e crítico","Trocando toda a equipe","Só quando dominar tudo"]'::jsonb, 'Por uma tarefa repetitiva que consome tempo', 'Começar pelo pequeno e repetitivo entrega ganho rápido e cria confiança.', 'medium', 'ia sem misterio', 'manual', 'approved', 0),

   (v_module_ids[2], v_course_id, 'Nos primeiros segundos de um conteúdo, o que mais importa?', 'multiple_choice', '["Gancho, primeira frase e primeira imagem","A trilha sonora","O logo da marca","O número de hashtags"]'::jsonb, 'Gancho, primeira frase e primeira imagem', 'Nos primeiros 3 segundos o público decide ficar ou passar.', 'medium', 'criacao que chama atencao', 'manual', 'approved', 0),
   (v_module_ids[2], v_course_id, 'Ao pedir uma imagem para IA, o que gera melhor resultado?', 'multiple_choice', '["Descrever assunto, estilo, luz e emoção","Pedir algo bonito","Enviar só uma palavra","Copiar prompt aleatório"]'::jsonb, 'Descrever assunto, estilo, luz e emoção', 'Descrição rica em contexto orienta a IA a entregar o que você imagina.', 'medium', 'criacao que chama atencao', 'manual', 'approved', 0),
   (v_module_ids[2], v_course_id, 'Como validar uma nova capa ou miniatura?', 'multiple_choice', '["Testando 3 versões e medindo o desempenho","Escolhendo a mais bonita para você","Perguntando a um amigo","Copiando o concorrente"]'::jsonb, 'Testando 3 versões e medindo o desempenho', 'Teste com dados reais é o único juiz confiável de criativos.', 'medium', 'criacao que chama atencao', 'manual', 'approved', 0),

   (v_module_ids[3], v_course_id, 'Qual é a espinha de um conteúdo que conecta?', 'multiple_choice', '["Dor, História, Virada, Aprendizado, Chamada","Introdução, Meio e Fim genéricos","Só ofertas","Só motivação"]'::jsonb, 'Dor, História, Virada, Aprendizado, Chamada', 'Essa estrutura funciona porque respeita como a mente humana consome história.', 'medium', 'conteudo que conecta', 'manual', 'approved', 0),
   (v_module_ids[3], v_course_id, 'Como manter a sua voz mesmo usando IA?', 'multiple_choice', '["Fornecer 3 frases suas para a IA imitar o tom","Deixar a IA escrever sozinha","Copiar textos prontos","Usar sempre o padrão da ferramenta"]'::jsonb, 'Fornecer 3 frases suas para a IA imitar o tom', 'Exemplos do seu jeito de falar calibram a IA para soar como você.', 'medium', 'conteudo que conecta', 'manual', 'approved', 0),
   (v_module_ids[3], v_course_id, 'Por que prova social converte mais que promessa?', 'multiple_choice', '["Porque cliente falando por você tem mais credibilidade","Porque é mais barato","Porque o algoritmo prefere","Porque é mais rápido"]'::jsonb, 'Porque cliente falando por você tem mais credibilidade', 'Depoimento de terceiro reduz risco percebido pelo próximo cliente.', 'medium', 'conteudo que conecta', 'manual', 'approved', 0),

   (v_module_ids[4], v_course_id, 'Qual é o maior desperdício em conteúdo hoje?', 'multiple_choice', '["Publicar em um único formato e ninguém ver","Publicar demais","Escrever textos longos","Usar imagens"]'::jsonb, 'Publicar em um único formato e ninguém ver', 'Um bom conteúdo em um formato só desperdiça alcance disponível.', 'medium', 'divulgacao que aparece', 'manual', 'approved', 0),
   (v_module_ids[4], v_course_id, 'O que mais gera presença de marca ao longo do tempo?', 'multiple_choice', '["Frequência somada a coerência","Um post viral esporádico","Só anúncio pago","Trocar de tema toda semana"]'::jsonb, 'Frequência somada a coerência', 'Aparecer com constância e coerência constrói memória de marca.', 'medium', 'divulgacao que aparece', 'manual', 'approved', 0),
   (v_module_ids[4], v_course_id, 'Como usar Perplexity e Gemini para divulgação?', 'multiple_choice', '["Descobrir perguntas reais do público para responder","Comprar seguidores","Automatizar spam","Copiar concorrentes"]'::jsonb, 'Descobrir perguntas reais do público para responder', 'Responder perguntas reais atrai tráfego orgânico qualificado.', 'medium', 'divulgacao que aparece', 'manual', 'approved', 0),

   (v_module_ids[5], v_course_id, 'Uma boa oferta cabe em quantas linhas?', 'multiple_choice', '["Cerca de 3 linhas: promessa, prova, preço, prazo","Uma página inteira","Duas palavras","Não precisa caber"]'::jsonb, 'Cerca de 3 linhas: promessa, prova, preço, prazo', 'Oferta clara e curta é mais fácil de decidir e compartilhar.', 'medium', 'venda com ia', 'manual', 'approved', 0),
   (v_module_ids[5], v_course_id, 'Qual é o roteiro de venda proposto no módulo?', 'multiple_choice', '["Conexão, Diagnóstico, Solução, Prova, Fechamento","Só desconto","Só apresentação do produto","Só depoimentos"]'::jsonb, 'Conexão, Diagnóstico, Solução, Prova, Fechamento', 'Esse roteiro respeita a jornada mental de compra do cliente.', 'medium', 'venda com ia', 'manual', 'approved', 0),
   (v_module_ids[5], v_course_id, 'Onde a maioria das vendas realmente acontece?', 'multiple_choice', '["No follow-up após o primeiro contato","No primeiro oi","Na primeira proposta","Nunca depende de follow-up"]'::jsonb, 'No follow-up após o primeiro contato', 'A maioria dos fechamentos ocorre depois do 3º contato — follow-up é ouro.', 'medium', 'venda com ia', 'manual', 'approved', 0),

   (v_module_ids[6], v_course_id, 'O que é, de fato, uma marca forte?', 'multiple_choice', '["A lembrança que você deixa no público","O tamanho do logo","A quantidade de cores","A idade da empresa"]'::jsonb, 'A lembrança que você deixa no público', 'Marca vive na memória de quem consome — não no arquivo do designer.', 'medium', 'marca que fica na mente', 'manual', 'approved', 0),
   (v_module_ids[6], v_course_id, 'Qual é uma boa fórmula de posicionamento em uma frase?', 'multiple_choice', '["Eu ajudo público a transformação através de método","Somos os melhores","Qualidade e preço","Missão, visão e valores"]'::jsonb, 'Eu ajudo público a transformação através de método', 'Essa fórmula obriga clareza sobre público, promessa e caminho.', 'medium', 'marca que fica na mente', 'manual', 'approved', 0),
   (v_module_ids[6], v_course_id, 'Como criar consistência visual sem depender de designer?', 'multiple_choice', '["Definir 2 cores, 1 fonte e 1 tipo de imagem e repetir","Trocar o visual toda semana","Copiar tendências","Usar tudo o que a IA gerar"]'::jsonb, 'Definir 2 cores, 1 fonte e 1 tipo de imagem e repetir', 'Poucos elementos repetidos com disciplina fixam reconhecimento.', 'medium', 'marca que fica na mente', 'manual', 'approved', 0),

   (v_module_ids[7], v_course_id, 'Como começar um plano de 30 dias que funciona?', 'multiple_choice', '["Escolhendo um único resultado principal","Escolhendo cinco metas ao mesmo tempo","Não definindo meta","Copiando plano dos outros"]'::jsonb, 'Escolhendo um único resultado principal', 'Foco em uma meta principal aumenta drasticamente a chance de execução.', 'medium', 'ideias em acao', 'manual', 'approved', 0),
   (v_module_ids[7], v_course_id, 'Qual rotina mínima o módulo recomenda?', 'multiple_choice', '["30 minutos por dia: criar, divulgar, responder","4 horas por dia","Só finais de semana","Uma vez por mês"]'::jsonb, '30 minutos por dia: criar, divulgar, responder', '30 minutos disciplinados por dia superam maratonas irregulares.', 'medium', 'ideias em acao', 'manual', 'approved', 0),
   (v_module_ids[7], v_course_id, 'Quais são as 3 métricas que importam?', 'multiple_choice', '["Alcance, conversas e vendas","Curtidas, seguidores e comentários","Só faturamento","Só seguidores"]'::jsonb, 'Alcance, conversas e vendas', 'Alcance abre porta, conversa qualifica, venda confirma o modelo.', 'medium', 'ideias em acao', 'manual', 'approved', 0);
END $$;