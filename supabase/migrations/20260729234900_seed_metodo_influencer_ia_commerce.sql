-- Seed idempotente: curso em standby 'Método Influencer IA Commerce' + 10 módulos.
-- Reproduz o estado versionado. Todos os registros permanecem is_published = false.
BEGIN;
INSERT INTO public.courses (id, track_id, slug, title, description, duration_minutes, level, cover_url, sort_order, is_published, workload_hours, price, certificate_enabled, allow_pdf_download, is_free, product_type, delivery_url)
VALUES ('3e846113-b1d4-4640-9f44-3f22296186bc', '12ec915f-ad6c-4537-9891-f67b67982eec', 'metodo-influencer-ia-commerce', 'Método Influencer IA Commerce', 'RASCUNHO INTERNO — NÃO PUBLICAR. Curso profundo sobre criação e operação de influencers hiper-realistas com IA para social commerce (TikTok Shop, Reels, Shorts). Cobre modelo de negócio, escolha de nicho/persona/produto, geração da personagem, consistência visual e de voz, vídeos de demonstração e prova de produto, scripts de venda com ganchos e quebra de objeções, operação de conteúdo em volume, publicação, testes e otimização por métricas, biblioteca de prompts/templates/workflows e boas práticas de transparência e conformidade.', 4800, 'Intermediário', NULL, 998, false, 80, 0.00, t, t, f, 'course', NULL)
ON CONFLICT (id) DO UPDATE SET track_id=EXCLUDED.track_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, duration_minutes=EXCLUDED.duration_minutes, level=EXCLUDED.level, sort_order=EXCLUDED.sort_order, workload_hours=EXCLUDED.workload_hours, price=EXCLUDED.price, certificate_enabled=EXCLUDED.certificate_enabled, allow_pdf_download=EXCLUDED.allow_pdf_download, is_free=EXCLUDED.is_free, product_type=EXCLUDED.product_type, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('59eeb4c1-04a9-4944-8693-4c56999944de', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm1-visao-de-mercado', 'Módulo 1 — Visão de mercado e modelo de negócio', 'Entenda o mercado de social commerce com influencers sintéticos: tamanho, players, formatos de monetização e onde está a margem real.', 'text', '## Objetivo do módulo
Compreender como o social commerce com influencers gerados por IA cria receita, quais são os modelos de negócio viáveis e como posicionar sua operação.

## Aulas
1. **O deslocamento do varejo para o feed** — como TikTok Shop, Reels e Shorts transformaram descoberta em compra por impulso.
2. **Anatomia da cadeia de valor** — fornecedor, criador, plataforma, afiliado, agência: quem captura qual parte da margem.
3. **Cinco modelos de monetização** — afiliação por comissão, marca própria/private label, dropship curado, prestação de serviço para marcas (UGC sintético), licenciamento da personagem.
4. **Unit economics** — CAC orgânico, taxa de conversão por vídeo, ticket médio, comissão média por categoria, custo de produção por vídeo com IA.
5. **Escolha do modelo inicial** — matriz risco × capital × velocidade de aprendizado.

## Entregáveis
- Planilha de unit economics preenchida com sua hipótese.
- Escolha documentada do modelo de negócio inicial.

## Checklist de conclusão
- [ ] Modelo de negócio definido
- [ ] Meta de receita e volume de vídeos/mês calculada
- [ ] Categoria-alvo escolhida', 240, 1, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('51a86625-f9dd-4160-a582-08eaaa598c60', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm2-nicho-persona-produto', 'Módulo 2 — Escolha de nicho, persona e produto', 'Selecione nicho, público e catálogo de produtos com critérios objetivos de demanda, margem e demonstrabilidade.', 'text', '## Objetivo do módulo
Evitar o erro mais caro da operação: escolher produto que não demonstra bem em vídeo curto.

## Aulas
1. **Critérios de nicho** — recorrência, dor visível, ticket, saturação, restrição de plataforma.
2. **Pesquisa de demanda** — leitura de tendências, busca por som/hashtag, catálogo de best-sellers, sazonalidade.
3. **Teste de demonstrabilidade** — o produto tem "momento uau" em até 3 segundos? Antes/depois? Prova física?
4. **Persona do público** — dor, contexto de uso, linguagem, objeções recorrentes, gatilho de compra.
5. **Curadoria de catálogo** — 1 produto herói + 3 satélites + 1 isca de baixo ticket.
6. **Análise de margem e logística** — comissão, prazo, taxa de devolução, risco reputacional.

## Entregáveis
- Ficha de nicho (1 página).
- Ficha de persona do público.
- Catálogo inicial com 5 produtos e nota de demonstrabilidade (0–10).

## Checklist de conclusão
- [ ] Nicho validado por dados, não por intuição
- [ ] Persona documentada com 5 objeções mapeadas
- [ ] Produto herói definido', 300, 2, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('8ff7eb30-243c-4182-958a-20cdf352d9f2', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm3-criacao-influencer', 'Módulo 3 — Criação da influencer hiper-realista', 'Construa a personagem: biotipo, rosto, semente de consistência, iluminação e realismo crível sem vale da estranheza.', 'text', '## Objetivo do módulo
Gerar uma personagem visualmente crível e reproduzível em centenas de cenas.

## Aulas
1. **Briefing da personagem** — idade aparente, etnia, biotipo, estilo, arquétipo, contexto socioeconômico coerente com o nicho.
2. **Do prompt ao rosto-base** — estrutura de prompt em camadas (sujeito, traços, luz, lente, textura de pele, imperfeições).
3. **Realismo técnico** — grão, profundidade de campo, temperatura de cor, poros e assimetria: por que a "perfeição" mata a credibilidade.
4. **Semente de consistência** — seed, referência facial, embedding/personagem salva, conjunto canônico de 12 fotos de referência.
5. **Ficha canônica** — ângulos, expressões, planos (close, meio, corpo inteiro) e cenários recorrentes.
6. **Erros comuns** — mãos, dentes, joias, texto em roupas, deriva facial entre gerações.

## Entregáveis
- Character Sheet com 12 imagens canônicas.
- Prompt-base versionado da personagem.

## Checklist de conclusão
- [ ] Rosto consistente em 12 imagens
- [ ] Prompt-base documentado e versionado
- [ ] Aprovação no teste de credibilidade (3 avaliadores externos)', 420, 3, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('c8fdb7a7-08ec-4036-bed2-2b65b3afcbf2', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm4-identidade-voz', 'Módulo 4 — Identidade visual, voz e consistência', 'Transforme a personagem em marca: paleta, guarda-roupa, cenários fixos, voz sintética e bíblia de estilo.', 'text', '## Objetivo do módulo
Garantir que qualquer vídeo novo seja imediatamente reconhecível como da mesma criadora.

## Aulas
1. **Bíblia de estilo** — paleta, tipografia de legenda, moldura, enquadramentos padrão.
2. **Guarda-roupa e cenários canônicos** — 5 looks + 4 cenários reutilizáveis para reduzir custo de produção.
3. **Voz** — escolha do timbre, cadência, sotaque regional, marcadores de fala; clonagem vs. voz sintética licenciada.
4. **Lip sync e naturalidade** — respiração, microexpressões, gestos, ritmo de corte.
5. **Tom verbal** — vocabulário, bordões, o que a personagem nunca diz.
6. **Controle de deriva** — auditoria semanal de consistência visual e sonora.

## Entregáveis
- Brand Book da influencer (visual + verbal + sonoro).
- Amostra de voz aprovada em 3 emoções.

## Checklist de conclusão
- [ ] Paleta e enquadramentos definidos
- [ ] Voz aprovada e arquivada
- [ ] Bordões e vocabulário documentados', 300, 4, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('c5b4bf11-964e-443e-975e-6aea38427561', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm5-demonstracao-produto', 'Módulo 5 — Vídeos de demonstração e prova de produto', 'Produza a cena que vende: manuseio, antes/depois, close de textura e prova de resultado sem enganar.', 'text', '## Objetivo do módulo
Dominar as cinco cenas que sustentam conversão em social commerce.

## Aulas
1. **As 5 cenas essenciais** — unboxing, uso real, antes/depois, close de detalhe, reação/depoimento.
2. **Composição do produto real com a personagem sintética** — quando usar chroma, composição em camadas, sombra e reflexo coerentes.
3. **Iluminação e coerência física** — direção da luz, contato com a superfície, escala do objeto.
4. **B-roll e cutaways** — como cobrir falhas de geração.
5. **Prova honesta** — o que pode e o que não pode ser afirmado; substituição de promessa por demonstração.
6. **Pipeline de produção da cena** — do storyboard ao render final em até 40 minutos.

## Entregáveis
- 5 cenas-modelo renderizadas do produto herói.
- Storyboard reutilizável.

## Checklist de conclusão
- [ ] 5 cenas produzidas
- [ ] Coerência física validada
- [ ] Nenhuma afirmação não comprovável', 420, 5, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('ba44c61c-ed73-4698-a915-09856304ad6b', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm6-scripts-ganchos-objecoes', 'Módulo 6 — Scripts de venda, ganchos e objeções', 'Arquitetura de roteiro para vídeo curto: gancho em 1,5s, tensão, demonstração, prova, oferta e CTA.', 'text', '## Objetivo do módulo
Escrever roteiros que retêm nos 3 primeiros segundos e convertem no último.

## Aulas
1. **Estrutura ARCO** — Atenção, Reconhecimento, Comprovação, Oferta.
2. **Biblioteca de 30 ganchos** — pergunta, erro comum, número, contraste visual, quebra de padrão, POV, alerta.
3. **Retenção** — curva de atenção, loops abertos, corte por batida, legenda como reforço.
4. **Prova e credibilidade** — dado, demonstração, comparação, depoimento.
5. **Quebra de objeções** — preço, ceticismo, prazo, adequação, risco; matriz objeção → resposta em 1 frase.
6. **CTA por estágio** — descoberta, consideração, decisão; CTA nativo da plataforma.
7. **Variação sistemática** — 1 roteiro-base → 8 variações para teste.

## Entregáveis
- 10 roteiros completos do produto herói.
- Matriz de objeções preenchida.

## Checklist de conclusão
- [ ] 30 ganchos catalogados
- [ ] 10 roteiros prontos
- [ ] CTA definido por estágio', 360, 6, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('d0d97219-b4d6-4f76-8a62-ff5c0048a6f9', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm7-operacao-conteudo', 'Módulo 7 — Operação de conteúdo e consistência', 'Monte a linha de produção: calendário, lotes, papéis, ferramentas, nomenclatura e controle de qualidade.', 'text', '## Objetivo do módulo
Sair do vídeo artesanal para uma operação previsível de volume.

## Aulas
1. **Meta de volume** — quantos vídeos por semana sustentam aprendizado estatístico.
2. **Produção em lote** — 1 dia de geração = 15 a 30 vídeos.
3. **Pipeline em 6 etapas** — ideia → roteiro → geração de cena → voz → edição → QA.
4. **Calendário editorial** — mix 40% demonstração, 30% educação, 20% entretenimento, 10% prova social.
5. **Nomenclatura e versionamento** — padrão de arquivos, tags de teste, pastas.
6. **Controle de qualidade** — checklist de 12 itens antes de publicar.
7. **Delegação** — o que automatizar, o que terceirizar, o que manter interno.

## Entregáveis
- Calendário de 30 dias preenchido.
- SOP da operação (documento de processo).

## Checklist de conclusão
- [ ] Pipeline documentado
- [ ] Lote-piloto de 15 vídeos produzido
- [ ] QA aplicado em 100% dos vídeos', 360, 7, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('cd2a1165-ca64-4a04-a094-7045b304a489', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm8-publicacao-testes-otimizacao', 'Módulo 8 — Publicação, testes e otimização', 'Publique com método: janelas, testes A/B, leitura de métricas e decisões de escala ou corte.', 'text', '## Objetivo do módulo
Transformar dados em decisão semanal de escala.

## Aulas
1. **Métricas que importam** — retenção 3s, tempo médio, taxa de clique no produto, conversão, GMV por vídeo.
2. **Protocolo de teste** — uma variável por vez: gancho, capa, CTA, produto, horário.
3. **Leitura de curva de retenção** — onde o público sai e o que isso significa.
4. **Ciclo de otimização semanal** — cortar o pior terço, clonar o melhor terço, testar o terço novo.
5. **Escala** — reaproveitar vencedor em outros formatos e plataformas; impulsionamento pago.
6. **Diagnóstico de queda** — saturação criativa, fadiga de oferta, mudança de distribuição.

## Entregáveis
- Painel de métricas semanal.
- Relatório de 2 ciclos de otimização.

## Checklist de conclusão
- [ ] Painel montado
- [ ] 2 ciclos completos executados
- [ ] Vencedor identificado e escalado', 300, 8, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('f4b10019-9e3a-4dd8-ac30-bb015bc9ac05', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm9-biblioteca-prompts-workflows', 'Módulo 9 — Biblioteca de prompts, templates e workflows', 'Acervo operacional: prompts de personagem e cena, templates de roteiro, checklists e fluxos de ferramentas.', 'text', '## Objetivo do módulo
Entregar o repositório reutilizável que sustenta a operação sem depender de memória.

## Seções da biblioteca
1. **Prompts de personagem** — base, variações de ângulo, expressão, idade, iluminação, correção de deriva.
2. **Prompts de cena** — unboxing, uso, antes/depois, close, ambiente externo, ambiente doméstico.
3. **Prompts de vídeo** — movimento de câmera, duração, ritmo, continuidade entre planos.
4. **Templates de roteiro** — ARCO, POV, comparativo, lista, mito × verdade, resposta a comentário.
5. **Templates de legenda e capa** — padrões de texto e hierarquia visual.
6. **Workflows de ferramentas** — geração de imagem → animação → voz → lip sync → edição → publicação, com pontos de decisão e alternativas.
7. **Checklists** — pré-produção, QA, publicação, revisão semanal.
8. **Versionamento** — como manter a biblioteca viva sem virar bagunça.

## Entregáveis
- Biblioteca organizada e versionada.
- Workflow principal em diagrama.

## Checklist de conclusão
- [ ] Prompts catalogados por categoria
- [ ] Templates prontos para uso
- [ ] Workflow documentado ponta a ponta', 420, 9, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
INSERT INTO public.modules (id, course_id, slug, title, description, content_type, content_text, duration_minutes, sort_order, is_published)
VALUES ('ffeec01d-aa83-4da7-9d39-58dca613509b', '3e846113-b1d4-4640-9f44-3f22296186bc', 'm10-limites-transparencia', 'Módulo 10 — Limites, transparência e boas práticas', 'Conformidade, sinalização de conteúdo sintético, direitos, publicidade e reputação de longo prazo.', 'text', '## Objetivo do módulo
Operar de forma sustentável: sem enganar consumidor, sem violar direitos, sem risco de derrubada de conta.

## Aulas
1. **Sinalização de conteúdo gerado por IA** — políticas das plataformas e como aplicar rótulos corretamente.
2. **Publicidade e relação comercial** — identificação de conteúdo pago/afiliado.
3. **Direitos de imagem e semelhança** — por que nunca gerar personagem parecida com pessoa real; verificação ativa.
4. **Voz** — consentimento, licenciamento e vedações.
5. **Alegações sobre produtos** — saúde, resultado, prazo: o que não afirmar.
6. **Proteção da operação** — backup da personagem, contas secundárias, plano de contingência para suspensão.
7. **Ética prática** — transparência que aumenta confiança e conversão em vez de reduzir.

## Entregáveis
- Política interna de conformidade (1 página).
- Checklist de conformidade aplicado a cada publicação.

## Checklist de conclusão
- [ ] Rótulos de IA aplicados
- [ ] Política interna documentada
- [ ] Nenhuma alegação proibida em uso', 240, 10, false)
ON CONFLICT (id) DO UPDATE SET course_id=EXCLUDED.course_id, slug=EXCLUDED.slug, title=EXCLUDED.title, description=EXCLUDED.description, content_type=EXCLUDED.content_type, content_text=EXCLUDED.content_text, duration_minutes=EXCLUDED.duration_minutes, sort_order=EXCLUDED.sort_order, updated_at=now();
COMMIT;
