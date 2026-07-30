
DO $$
DECLARE
  v_course uuid;
BEGIN
  SELECT id INTO v_course FROM public.courses WHERE slug = 'metodo-ia-criativa';
  IF v_course IS NULL THEN RAISE NOTICE 'curso nao encontrado'; RETURN; END IF;

  WITH m AS (
    SELECT id, sort_order FROM public.modules WHERE course_id = v_course
  ), d(mso, ord, q, opts, ans, expl, typ) AS (
    VALUES
    -- M1
    (1,1,'Qual é o entregável obrigatório da Aula-mestra 01?','["Um vídeo finalizado de 90 segundos","O Manifesto Criativo, briefing-raiz das próximas aulas","Uma trilha sonora original","Um portfólio com 10 cases"]','O Manifesto Criativo, briefing-raiz das próximas aulas','O M1 instala o método e entrega o Manifesto Criativo, documento que guia todos os módulos seguintes.','multiple_choice'),
    (1,2,'Por que usar IA sem método tende a virar ruído?','["Porque as ferramentas são fracas","Porque a ferramenta executa, mas a direção criativa continua sendo decisão humana","Porque falta poder de processamento","Porque IA não gera imagens boas"]','Porque a ferramenta executa, mas a direção criativa continua sendo decisão humana','Sem intenção definida antes do prompt, a saída é aleatória: a IA executa, quem dirige é você.','multiple_choice'),
    (1,3,'O que muda de um módulo para o outro dentro do Método?','["O ciclo criativo inteiro","A mídia, o contexto e a profundidade — o ciclo permanece","As ferramentas obrigatórias","A ordem das fases"]','A mídia, o contexto e a profundidade — o ciclo permanece','O ciclo é estável; o que varia é a mídia trabalhada e o nível de profundidade.','multiple_choice'),
    (1,4,'O Ciclo Criativo FCIA precisa ser reinventado a cada projeto.','["Verdadeiro","Falso"]','Falso','O ciclo é o mesmo em todos os projetos; muda apenas a aplicação.','true_false'),
    (1,5,'Qual atitude descreve alguém que dirige a IA em vez de apenas usá-la?','["Aceitar a primeira saída gerada","Definir intenção, critério e revisão antes e depois de gerar","Trocar de ferramenta a cada tentativa","Gerar o maior número possível de variações"]','Definir intenção, critério e revisão antes e depois de gerar','Direção é decidir antes e julgar depois; uso passivo é aceitar o primeiro resultado.','multiple_choice'),
    -- M2
    (2,1,'Qual é o entregável da Aula-mestra 02?','["Um roteiro audiovisual de 60 a 90 segundos estruturado em beats","Um kit de imagens","Uma proposta comercial","Uma trilha de 2 minutos"]','Um roteiro audiovisual de 60 a 90 segundos estruturado em beats','O M2 aplica o ciclo sobre texto e entrega o roteiro que sustenta os módulos seguintes.','multiple_choice'),
    (2,2,'Qual sequência de beats é ensinada no módulo?','["Abertura, tensão, virada, prova e fechamento","Introdução, meio e fim","Problema e solução","Gancho e oferta"]','Abertura, tensão, virada, prova e fechamento','Essa estrutura garante ritmo emocional legível em peças curtas.','multiple_choice'),
    (2,3,'O que se extrai da leitura do briefing antes de escrever?','["A quantidade de planos","A promessa única da peça","A paleta de cores","O orçamento do cliente"]','A promessa única da peça','A promessa única orienta todas as decisões seguintes de imagem, vídeo e som.','multiple_choice'),
    (2,4,'O roteiro do M2 serve de base de execução para quais módulos?','["Apenas para o M3","Do M3 ao M6 — imagem, vídeo, som e integração","Somente para o M10","Para nenhum, é exercício isolado"]','Do M3 ao M6 — imagem, vídeo, som e integração','O mesmo projeto-guia atravessa imagem, vídeo, som e integração.','multiple_choice'),
    (2,5,'O ideal é gerar as imagens primeiro e escrever o roteiro depois.','["Verdadeiro","Falso"]','Falso','A direção criativa é decidida antes de gerar qualquer mídia.','true_false'),
    -- M3
    (3,1,'Qual é o entregável da Aula-mestra 03?','["Um kit visual coerente de 6 a 10 imagens ligadas aos beats","Um vídeo de 3 minutos","Um contrato de prestação de serviço","Uma playlist de referência"]','Um kit visual coerente de 6 a 10 imagens ligadas aos beats','O kit visual traduz o roteiro em direção de arte com identidade reconhecível.','multiple_choice'),
    (3,2,'Quais elementos sustentam a identidade visual do kit?','["Paleta, enquadramento, luz, textura e assinatura visual","Apenas a resolução das imagens","O número de prompts usados","A ferramenta escolhida"]','Paleta, enquadramento, luz, textura e assinatura visual','São as decisões estéticas que mantêm coerência entre peças.','multiple_choice'),
    (3,3,'Qual é a ordem correta de trabalho no módulo de imagem?','["Promptar primeiro e escolher a emoção depois","Definir a emoção-alvo do beat e só então promptar","Gerar 50 imagens e filtrar no fim","Copiar prompts prontos da internet"]','Definir a emoção-alvo do beat e só então promptar','Primeiro se decide o que a imagem precisa fazer sentir; o prompt vem depois.','multiple_choice'),
    (3,4,'Imagens geradas em ferramentas diferentes nunca podem ter identidade coerente.','["Verdadeiro","Falso"]','Falso','A coerência vem das decisões estéticas, não da ferramenta.','true_false'),
    (3,5,'No Ciclo FCIA, o módulo de imagem trabalha principalmente quais fases?','["Ler e Pensar","Criar e Encantar","Vender e Revisar","Nenhuma das fases"]','Criar e Encantar','A imagem materializa a criação e trabalha o encantamento visual.','multiple_choice'),
    -- M4
    (4,1,'Qual é o entregável da Aula-mestra 04?','["Uma sequência de vídeo de 60 a 90 segundos com continuidade de identidade","Uma imagem em alta resolução","Um roteiro revisado","Uma tabela de preços"]','Uma sequência de vídeo de 60 a 90 segundos com continuidade de identidade','O vídeo dá movimento aos beats mantendo o kit visual do M3.','multiple_choice'),
    (4,2,'Cada beat do roteiro deve ser traduzido em quê?','["Intenção de plano","Duração fixa de 5 segundos","Um efeito de transição","Uma legenda"]','Intenção de plano','Antes de gerar, define-se o que aquele segundo precisa provocar.','multiple_choice'),
    (4,3,'Sobre o que a sequência de vídeo é construída?','["Nos beats do M2 e no kit visual do M3","Em clipes aleatórios de banco de imagens","Na trilha sonora escolhida antes","Em prints do portfólio"]','Nos beats do M2 e no kit visual do M3','A continuidade depende de reaproveitar as decisões já tomadas.','multiple_choice'),
    (4,4,'Qual é o erro mais comum ao usar IA para vídeo?','["Gerar clipes soltos sem ritmo nem direção","Planejar demais antes de gerar","Usar o mesmo kit visual","Definir a intenção de cada plano"]','Gerar clipes soltos sem ritmo nem direção','Sem direção de tempo e emoção, o resultado vira colagem.','multiple_choice'),
    (4,5,'Vídeo com IA é apenas gerar clipes bonitos e independentes entre si.','["Verdadeiro","Falso"]','Falso','Vídeo é dirigir tempo, ritmo e emoção sobre os beats.','true_false'),
    -- M5
    (5,1,'Qual é a função estratégica do som na peça?','["Preencher silêncio","Fixar a peça na memória e sustentar a atenção","Aumentar a duração do vídeo","Substituir o roteiro"]','Fixar a peça na memória e sustentar a atenção','Som intencional é o que faz o cérebro decidir se aquilo mereceu atenção.','multiple_choice'),
    (5,2,'Quais camadas sonoras o módulo ensina a dirigir?','["Música, ambiência e voz","Somente música","Somente narração","Efeitos de transição visual"]','Música, ambiência e voz','As três camadas juntas criam identidade sonora.','multiple_choice'),
    (5,3,'Qual é a prática correta antes de gerar áudio com IA?','["Aceitar a primeira faixa sugerida","Especificar emoção, ritmo e identidade sonora desejados","Escolher pelo nome do gênero apenas","Gerar 20 faixas e sortear"]','Especificar emoção, ritmo e identidade sonora desejados','Dirigir som é decidir a intenção antes da geração.','multiple_choice'),
    (5,4,'A trilha sonora é apenas fundo decorativo e não afeta a percepção da peça.','["Verdadeiro","Falso"]','Falso','O som é decisivo para memória e emoção.','true_false'),
    (5,5,'O que caracteriza o uso passivo de IA em áudio?','["Aceitar a primeira sugestão da plataforma sem critério","Testar variações com critério definido","Ajustar a ambiência ao beat","Alinhar voz e ritmo ao roteiro"]','Aceitar a primeira sugestão da plataforma sem critério','Uso passivo é ausência de direção.','multiple_choice'),
    -- M6
    (6,1,'No Método, integrar significa o quê?','["Juntar arquivos na timeline","Orquestrar mídias sob um único eixo criativo","Exportar em alta resolução","Publicar em várias redes"]','Orquestrar mídias sob um único eixo criativo','Integrar não é somar: cada mídia entra no momento e na intensidade certos.','multiple_choice'),
    (6,2,'Qual é o entregável da Aula-mestra 06?','["Uma peça audiovisual completa de 60 a 120 segundos","Uma imagem de capa","Um roteiro alternativo","Um orçamento"]','Uma peça audiovisual completa de 60 a 120 segundos','A peça reúne roteiro, imagem, vídeo e som sob um só eixo.','multiple_choice'),
    (6,3,'Qual é o critério objetivo de sucesso da integração?','["Ter mais de 10 planos","Um espectador leigo descrever a peça em uma frase","Usar quatro ferramentas diferentes","Ter trilha original"]','Um espectador leigo descrever a peça em uma frase','Se a mensagem é legível em uma frase, o eixo criativo funcionou.','multiple_choice'),
    (6,4,'O que faz um trabalho parecer colagem de IA?','["Mídias sem eixo criativo comum","Uso de um kit visual coerente","Ritmo planejado","Som dirigido"]','Mídias sem eixo criativo comum','Falta de eixo é o que denuncia a colagem.','multiple_choice'),
    (6,5,'Integrar é apenas empilhar os arquivos gerados nos módulos anteriores.','["Verdadeiro","Falso"]','Falso','Integração exige orquestração de intenção, ritmo e assinatura.','true_false'),
    -- M7
    (7,1,'O que caracteriza um padrão visual autoral?','["Escolhas recorrentes e intencionais de paleta, ritmo, tipografia e tom","Usar sempre o mesmo preset","Copiar referências famosas","Publicar sempre no mesmo horário"]','Escolhas recorrentes e intencionais de paleta, ritmo, tipografia e tom','Autoria vem da repetição consciente de decisões, não de presets.','multiple_choice'),
    (7,2,'Qual a diferença entre padrão e fórmula?','["Padrão é coerência com intenção; fórmula é repetição sem intenção","Não há diferença","Fórmula é mais sofisticada","Padrão só existe em fotografia"]','Padrão é coerência com intenção; fórmula é repetição sem intenção','Padrão preserva identidade; fórmula engessa o trabalho.','multiple_choice'),
    (7,3,'Como se testa se você já tem assinatura visual?','["Peças diferentes ainda são reconhecidas como suas","O número de seguidores cresce","Você usa a mesma ferramenta sempre","Todas as peças ficam idênticas"]','Peças diferentes ainda são reconhecidas como suas','Reconhecimento em contextos distintos é o teste real.','multiple_choice'),
    (7,4,'Usar sempre o mesmo preset garante autoria.','["Verdadeiro","Falso"]','Falso','Preset é atalho técnico; autoria é decisão criativa recorrente.','true_false'),
    (7,5,'Qual é o benefício comercial de ter um padrão autoral?','["O cliente contrata previsibilidade de qualidade e estilo","Reduz o custo das ferramentas","Elimina a necessidade de roteiro","Dispensa portfólio"]','O cliente contrata previsibilidade de qualidade e estilo','Padrão reconhecível é ativo de venda.','multiple_choice'),
    -- M8
    (8,1,'Qual é a função de um portfólio no Método?','["Provar critério e resultado, não exibir volume","Mostrar tudo o que já foi gerado","Listar as ferramentas usadas","Exibir prompts brutos"]','Provar critério e resultado, não exibir volume','Portfólio é prova de decisão criativa e resultado.','multiple_choice'),
    (8,2,'Qual estrutura organiza melhor um case?','["Problema, decisão criativa, execução e resultado","Ferramenta, prompt e print","Data, cliente e preço","Título e imagem apenas"]','Problema, decisão criativa, execução e resultado','Essa narrativa mostra raciocínio, não sorte.','multiple_choice'),
    (8,3,'O que vale mais em um portfólio?','["Poucas peças fortes e bem explicadas","Muitas peças medianas","Somente peças pessoais","Volume de gerações"]','Poucas peças fortes e bem explicadas','Curadoria comunica critério.','multiple_choice'),
    (8,4,'Mostrar geração bruta sem contexto fortalece a percepção de valor.','["Verdadeiro","Falso"]','Falso','Sem contexto, a peça parece resultado da ferramenta e não do profissional.','true_false'),
    (8,5,'O que o cliente realmente avalia ao ver o portfólio?','["Se você resolve o problema dele com critério","Quantas ferramentas você domina","O tempo de renderização","O número de peças publicadas"]','Se você resolve o problema dele com critério','Portfólio é argumento de contratação.','multiple_choice'),
    -- M9
    (9,1,'Qual deve ser a base da precificação?','["Valor entregue e escopo definido","Tempo de renderização","Número de prompts usados","Preço da assinatura da ferramenta"]','Valor entregue e escopo definido','Preço acompanha resultado e responsabilidade, não custo técnico.','multiple_choice'),
    (9,2,'Quais elementos uma proposta profissional deve conter?','["Escopo, entregáveis, prazos, rodadas de revisão e preço","Apenas o preço final","Somente o prazo","Lista de ferramentas"]','Escopo, entregáveis, prazos, rodadas de revisão e preço','Clareza no documento evita conflito depois.','multiple_choice'),
    (9,3,'Como evitar rodadas infinitas de revisão?','["Definir o número de rodadas no escopo da proposta","Aceitar todos os pedidos do cliente","Cobrar mais caro","Entregar mais rápido"]','Definir o número de rodadas no escopo da proposta','Limite acordado protege prazo e margem.','multiple_choice'),
    (9,4,'Usar IA obriga o profissional a cobrar menos pelo trabalho.','["Verdadeiro","Falso"]','Falso','O cliente paga pelo resultado e pela direção criativa, não pela ferramenta.','true_false'),
    (9,5,'Qual prática de precificação o Método desaconselha?','["Cobrar por hora de ferramenta ou por prompt","Cobrar por projeto com escopo fechado","Cobrar por pacote de entregáveis","Cobrar por uso e licenciamento"]','Cobrar por hora de ferramenta ou por prompt','Esse modelo desvaloriza a decisão criativa.','multiple_choice')
  )
  INSERT INTO public.questions
    (module_id, course_id, question, type, options, correct_answer, explanation, sort_order, difficulty, source_type, status)
  SELECT m.id, v_course, d.q, d.typ, d.opts::jsonb, d.ans, d.expl, d.ord, 'medium', 'manual', 'approved'
  FROM d JOIN m ON m.sort_order = d.mso
  WHERE NOT EXISTS (
    SELECT 1 FROM public.questions x WHERE x.module_id = m.id AND x.sort_order = d.ord
  );
END $$;
