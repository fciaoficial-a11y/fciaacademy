
DO $$
DECLARE
  cid uuid;
BEGIN
  SELECT id INTO cid FROM public.courses WHERE slug = 'venda-com-ia';

  -- ============ MÓDULO 1 ============
  UPDATE public.modules SET content_text = $M1$
## Bem-vindo ao curso Venda com IA

Vender mudou. Não porque a IA substituiu o vendedor — mas porque **o vendedor que domina IA opera em outra velocidade**: pesquisa mais rápido, escreve melhor, personaliza em escala e organiza a rotina sem depender de força de vontade.

Este módulo te tira do uso ingênuo de IA (o "escreve um e-mail de vendas") e te coloca no modo profissional: IA como **copiloto comercial** dentro de um processo repetível.

> Ao final, você não vai só *saber* que IA ajuda a vender — vai enxergar **onde ela entra no seu funil** e como usá-la com intenção.

---

## 🎯 Objetivo do Módulo

Ao concluir este módulo, você será capaz de:

- Explicar o que é **venda assistida por IA** com suas palavras.
- Diferenciar **curiosidade** de **sistema comercial**.
- Identificar **3 etapas do funil** onde a IA gera valor imediato.
- Escolher **ferramentas iniciais** de pesquisa, mensagem e organização.
- Aplicar **prompts prontos** e uma **rotina** com IA já nesta semana.

---

## Bloco 1 — O que é venda assistida por IA

Venda com IA **não é disparo em massa**. É diagnóstico assistido: você entende o cliente melhor, mais rápido e com mais profundidade do que o concorrente que ainda opera no improviso.

A IA generativa funciona como um **analista comercial** 24h. Ela não fecha por você — **amplifica** cada etapa do processo. Três coisas precisam existir juntas:

1. **Objetivo claro** (agendar, avançar proposta, reativar, aumentar ticket).
2. **Ferramenta certa** para a tarefa (pesquisa, mensagem, resumo).
3. **Processo repetível**, executado toda semana, sem depender de inspiração.

O segredo não está na ferramenta. Está em **quem conduz**.

---

## Bloco 2 — Curiosidade x Sistema comercial

**Modo curiosidade:** uso esporádico, prompt vago, resultado genérico, pipeline igual.
**Modo sistema:** uso diário em blocos fixos, prompts com contexto, edição com sua voz, biblioteca crescendo.

> A virada acontece quando você para de *"testar IA para vender"* e começa a **operar vendas com IA** dentro da rotina.

Este curso te coloca no modo sistema já a partir deste módulo.

---

## Bloco 3 — Onde a IA entra no funil

- **Prospecção:** contexto do lead, dor provável, gancho de abordagem.
- **Reunião:** resumo da call, dores, próximos passos, framework de diagnóstico.
- **Proposta:** rascunho em minutos, com vocabulário do cliente.
- **Follow-up:** cadência sem soar ansioso, reativação de base fria.

> Onde há palavra, decisão ou relacionamento, há espaço para IA.

---

## Bloco 4 — Direção humana + execução assistida

Guarde este princípio:

> **Direção é humana. Execução é assistida.**

Você decide segmento, ângulo, tom e assinatura. A IA gera variações, estrutura argumentos e monta rascunhos.

Fluxo em 5 passos:

1. **Decide** com quem falar e o que quer alcançar.
2. **Escreve o prompt** com contexto + objetivo + referência.
3. **Recebe** o rascunho.
4. **Edita** para virar voz própria (regra 30% IA / 70% você).
5. **Envia** com nome e responsabilidade.

Quando você inverte a lógica — deixa a IA escolher o ângulo e só copia — o resultado fica genérico e fácil de recusar.

---

## Bloco 5 — Ferramentas iniciais (escolha 1 de cada)

- **Pesquisa:** ChatGPT, Claude ou Perplexity.
- **Escrita comercial:** ChatGPT, Claude ou Gemini.
- **Organização:** Notion com IA, Google Docs/Sheets ou pasta simples no Drive.

Use por 30 dias antes de trocar. Pular de ferramenta é o jeito mais rápido de não dominar nenhuma.

---

## Bloco 6 — Prompts essenciais

**Prompt 1 — Pesquisa de lead**
```
Aja como analista comercial.
Lead: [nome, site, LinkedIn]. Meu produto: [1 linha].
Devolva: (1) o que a empresa faz, (2) 3 dores prováveis,
(3) 5 perguntas de descoberta, (4) 1 gancho em 2 frases.
```

**Prompt 2 — Primeira abordagem**
```
Escreva abordagem para [canal].
Lead: [cargo, empresa, contexto]. Objetivo: agendar 20 min.
Tom: consultivo, curto, sem clichê. Máx. 90 palavras.
Formato: gancho (1 linha) + valor (2 linhas) + convite objetivo.
```

**Prompt 3 — Resumo de reunião**
```
Cole abaixo minhas anotações: "[cole]".
Devolva: (1) dor principal, (2) dores secundárias,
(3) objeções, (4) próximos passos, (5) follow-up em 5 linhas.
```

Salve em um documento seu. É a **base da sua biblioteca comercial**.

---

## Bloco 7 — Rotina semanal enxuta (3h)

- **Segunda (60 min):** liste 10 leads, rode o Prompt 1 nos 5 prioritários.
- **Quarta (60 min):** use o Prompt 2 e envie em bloco. Edite com sua voz.
- **Sexta (60 min):** rode o Prompt 3 para as calls da semana e organize propostas.

Em 4 semanas: 20 leads pesquisados, 40 mensagens com contexto real e uma biblioteca que roda sozinha.

---

## 💡 Exemplo prático

**Rafael**, consultor B2B, tinha lista fria e pipeline travado. Rodou o Prompt 1 em 10 leads, priorizou 7 com gancho real (expansão, troca de diretor), enviou o Prompt 2 e fechou a semana com **3 respostas positivas, 2 reuniões e 1 proposta aprovada na primeira versão**. Nada mágico — sistema.

---

## ✅ Checklist da semana

- [ ] Escolhi **1 ferramenta de pesquisa** e **1 de escrita**.
- [ ] Defini onde vou salvar prompts e histórico.
- [ ] Rodei o **Prompt 1** em 3 leads reais.
- [ ] Enviei **3 abordagens** com o Prompt 2, editadas com minha voz.
- [ ] Fiz **1 resumo de call** com o Prompt 3.
- [ ] Guardei os **prompts que funcionaram** na biblioteca.

---

## ⚠️ Erros comuns que você vai evitar

- Achar que IA é redator (é ferramenta de pensamento antes de escrita).
- Usar como curiosidade e esperar pipeline de sistema.
- Enviar sem editar — cliente sente o "cheiro de IA".
- Prompt vago = entrega genérica.
- Testar 5 ferramentas ao mesmo tempo.

---

## 🚀 Fechamento

Você agora tem princípio, ferramentas, prompts e rotina. Isso é um **sistema**, não uma curiosidade. Você não é mais espectador da IA no comercial — é **operador**.

---

## ➡️ Próximo módulo: Pesquisa, Diagnóstico e Abordagem

No próximo módulo, você vai aprender a **entrar em qualquer conversa preparado** — com contexto do lead, hipótese de dor e abordagem calibrada. Nos vemos lá.
$M1$
  WHERE course_id = cid AND sort_order = 1;

  -- ============ MÓDULO 2 ============
  UPDATE public.modules SET content_text = $M2$
## Bem-vindo ao Módulo 2

A venda não começa na proposta. Começa na **primeira frase** que você escreve para o lead — e essa frase depende de **preparação real**. Aqui você usa IA como assistente de pesquisa e diagnóstico para chegar sabendo do que o cliente precisa antes dele contar.

> Nada de "template com nome trocado". Você vai abrir cada conversa com gancho real, hipótese de dor e pergunta que só cabe naquele cliente.

---

## 🎯 Objetivo do Módulo

- Fazer **pesquisa de lead em menos de 10 minutos** com IA.
- Construir uma **hipótese de dor** antes do primeiro contato.
- Aplicar frameworks de diagnóstico (**SPIN, GAP, RCD**).
- Escrever **abordagens personalizadas** que param o dedo do lead.
- Conduzir a **primeira call** com script flexível.

---

## Bloco 1 — Por que a maioria erra a abordagem

O vendedor médio abre o LinkedIn e escreve *"vi seu perfil e acho que temos sinergia"*. O lead ignora em 2 segundos. O treinado pergunta antes: **o que essa empresa vive agora? que dor tem chance de ressoar?**

IA reduz essa preparação de 30 min para 8. Guarde:

> **Personalização não é trocar o nome. É trocar a frase inteira.**

---

## Bloco 2 — Anatomia de uma pesquisa com IA

Uma boa pesquisa responde 5 perguntas antes do primeiro contato:

1. **O que a empresa faz** (1 parágrafo, sem jargão).
2. **Momento** (crescimento, reestruturação, corte, expansão).
3. **Dor provável** ligada ao seu produto.
4. **Quem é a pessoa** (cargo, escopo, sinais no perfil).
5. **Gancho** — o dado que só cabe nesse lead.

Sem input (site, LinkedIn, notícia), a IA chuta. Chute em vendas é o caminho mais curto para o "não obrigado".

---

## Bloco 3 — Frameworks de diagnóstico

Escolha **um** e treine com IA antes de calls importantes.

- **SPIN** — Situação → Problema → Implicação → Necessidade.
- **GAP** — onde está × onde quer chegar × custo da distância.
- **RCD** — Realidade → Consequência → Direção.

IA monta o roteiro adaptado. Você conduz a conversa.

---

## Bloco 4 — Direção humana + execução assistida

**Direção humana:** escolha do segmento, leitura entre linhas, decisão do ângulo.
**Execução assistida:** varredura de fontes, hipóteses de dor, 3 versões de abordagem em tons diferentes.

A IA propõe rotas. Você escolhe.

---

## Bloco 5 — A anatomia da primeira mensagem

Toda abordagem forte tem 4 partes:

1. **Gancho** (1 linha específica do lead).
2. **Valor** (2 linhas ligando o gancho ao que você resolve).
3. **Prova curta** (1 caso, número ou referência).
4. **Convite** objetivo (com opção de horário).

Se cortar essa estrutura, vira spam. Se seguir, vira conversa.

---

## Bloco 6 — Prompts essenciais

**Prompt 1 — Diagnóstico do lead**
```
Aja como analista comercial sênior.
Lead: [site, LinkedIn, notícia recente].
Meu produto: [1 linha].
Devolva: (1) o que a empresa faz, (2) momento atual,
(3) 3 dores prováveis, (4) 5 perguntas de descoberta,
(5) 1 gancho específico em 2 frases.
```

**Prompt 2 — Abordagem em 4 partes**
```
Escreva abordagem para [canal].
Lead: [cargo, empresa, gancho].
Objetivo: agendar conversa de 20 min.
Formato: gancho (1 linha), valor (2 linhas),
prova curta (1 linha), convite objetivo. Máx. 90 palavras.
Tom: consultivo, sem clichê.
```

**Prompt 3 — Roteiro de call**
```
Prepare roteiro de call de descoberta com [lead].
Framework: [SPIN/GAP/RCD]. Contexto: [cole a pesquisa].
Devolva: 5 perguntas por etapa + 3 gatilhos para aprofundar.
```

---

## Bloco 7 — Rotina de pesquisa e abordagem

- **Segunda:** liste 10 leads, rode Prompt 1 nos 5 prioritários.
- **Terça:** rode Prompt 2 e envie em bloco.
- **Quinta:** prepare com Prompt 3 as calls agendadas.

Não é sobre volume. É sobre **preparação por lead que importa**.

---

## 💡 Exemplo prático

**Marina** vende consultoria para varejo. Antes, mandava mensagem padrão. Passou a rodar o Prompt 1 e descobriu que 3 dos leads da semana tinham inaugurado loja nova. Trocou o gancho de *"trabalho com varejo"* para *"vi que vocês abriram em Campinas — como está a operação da segunda unidade?"*. Resultado: **4 respostas em 6 mensagens** e 2 reuniões marcadas.

---

## ✅ Checklist deste módulo

- [ ] Escolhi **1 framework** (SPIN, GAP ou RCD).
- [ ] Rodei o **Prompt 1** em 5 leads reais.
- [ ] Escrevi hipótese de dor para cada.
- [ ] Enviei **5 abordagens** no formato de 4 partes.
- [ ] Preparei **1 call** com o Prompt 3.
- [ ] Salvei os ganchos que geraram resposta.

---

## ⚠️ Erros comuns que você vai evitar

- Pular a pesquisa e "chutar" a mensagem.
- Confundir personalização com trocar o nome.
- Enviar a mesma abordagem para segmentos diferentes.
- Ir para a call sem hipótese de dor.
- Ignorar o momento da empresa (crescimento, corte, troca de diretor).

---

## 🚀 Fechamento

Preparação vira vantagem competitiva quando ninguém mais faz. Com IA, você prepara em 8 min o que o concorrente ainda faz em 30 — ou não faz. Esse é o seu ganho.

---

## ➡️ Próximo módulo: Objeções, Follow-up e Fechamento

No próximo módulo você aprende a **conduzir a decisão** — sem pressão, sem sumir e sem forçar. Nos vemos lá.
$M2$
  WHERE course_id = cid AND sort_order = 2;

  -- ============ MÓDULO 3 ============
  UPDATE public.modules SET content_text = $M3$
## Bem-vindo ao Módulo 3

Objeção não é rejeição — é **pedido de mais informação disfarçado de "não"**. Follow-up não é insistência — é **conduzir uma decisão que já faz sentido para os dois lados**. Neste módulo, você opera as duas coisas com IA como copiloto, com método e sem perder o timing.

> Você sai com banco de objeções, cadência de follow-up e roteiro de fechamento — prontos para rodar na sua semana real.

---

## 🎯 Objetivo do Módulo

- **Antecipar** as 5 objeções mais comuns do seu produto.
- Construir um **banco de objeções** com múltiplas respostas.
- Executar **cadência de follow-up** de 3, 7 e 14 dias sem parecer ansioso.
- Reengajar **leads frios** com contexto novo.
- Estruturar o **momento do fechamento** sem forçar decisão.

---

## Bloco 1 — Os 3 tipos de objeção

- **Racional** ("está caro", "vou comparar") → responda com **dado, número, retorno**.
- **Emocional** ("preciso pensar", "não é o momento") → responda com **empatia, história curta, redução de risco**.
- **Estratégica** ("já temos fornecedor", "não é prioridade") → responda com **pergunta que reposiciona**.

Responder emoção com planilha, ou razão com abraço, destrói venda.

---

## Bloco 2 — Banco de objeções: seu maior ativo

Estrutura mínima por objeção:

```
Objeção: [texto literal]
Tipo: [racional / emocional / estratégica]
Resposta 1 (dado)     — 4 linhas
Resposta 2 (empatia)  — 4 linhas
Resposta 3 (provocação) — 4 linhas
Pergunta de reabertura — 1 linha
```

Adicione 2 objeções por semana. Em 3 meses você tem 26 objeções × 3 respostas — cobertura maior que o vendedor médio constrói em anos.

---

## Bloco 3 — Cadência de follow-up sem ansiedade

- **Dia 0** — proposta enviada.
- **Dia 3** — pergunta objetiva sobre parte específica.
- **Dia 7** — insight ou material que **agrega e não empurra**.
- **Dia 14** — reabertura com pergunta boa mesmo se o lead estiver frio.
- **Dia 30** — reativação com contexto novo, sem cobrar decisão.

Cada mensagem tem função diferente. Nenhuma pergunta *"e aí?"*.

---

## Bloco 4 — Direção humana + execução assistida

**Você decide:** o tipo de objeção, se é hora de responder ou perguntar, se recua ou avança.
**A IA executa:** 3 variações de resposta, follow-up com base no resumo, sugestão de dado ou história.

---

## Bloco 5 — O momento do fechamento

Fechamento não é *"e aí, fecha?"*. É **reduzir o custo psicológico do sim**:

1. **Resumir a decisão** com clareza.
2. **Explicitar o próximo passo** operacional (assinatura, kickoff).
3. **Reduzir risco** (garantia, teste, milestone).
4. **Convidar** — não pressionar. *"Faz sentido seguirmos na sexta?"* vale mais que *"podemos fechar?"*.

Se o cliente diz **não** no fechamento, quase sempre a venda foi perdida no **diagnóstico**. Anote onde.

---

## Bloco 6 — Prompts essenciais

**Prompt 1 — Antecipação de objeções**
```
Sou vendedor de [produto], ticket [X]. Público: [descreva].
Liste 8 objeções prováveis, classificadas em racional/emocional/estratégica.
Para cada uma: resposta em 4 linhas + pergunta de reabertura em 1 linha.
```

**Prompt 2 — 3 respostas para a mesma objeção**
```
Cliente disse: "[objeção]". Contexto: [ticket, estágio].
Escreva 3 respostas: (1) racional com dado, (2) empática com história,
(3) provocativa com pergunta. Máx. 4 linhas cada.
```

**Prompt 3 — Follow-up dia 3, 7, 14, 30**
```
Proposta enviada em [data]. Última interação: "[resumo]".
Escreva 4 mensagens (dia 3, 7, 14, 30). Máx. 5 linhas cada.
Sem "só passando aqui".
```

**Prompt 4 — E-mail de fechamento**
```
Escreva e-mail de fechamento pós-conversa positiva.
Acordo: [escopo, valor, prazo].
Formato: reforço (2 linhas) + próximo passo + redução de risco + convite com data.
Tom: seguro, sem euforia.
```

---

## Bloco 7 — Rotina de follow-up disciplinada

- **Todo dia (20 min):** abra o pipeline, filtre follow-ups do dia, rode o Prompt 3, edite e envie.
- **Sexta (60 min):** revise pipeline, reative leads sem toque há 14+ dias, adicione 2 objeções novas ao banco.

Follow-up disciplinado é o que separa vendedor médio de top. Não depende de talento — **depende de rotina**.

---

## 💡 Exemplo prático

**Bruno** tinha 12 propostas paradas há 15+ dias. Rodou o Prompt 3 nas 12, enviou em blocos. 5 responderam, 3 pediram nova reunião, 2 apresentaram objeção de preço (Prompt 2). Fechou **2 contratos de R$ 30k** que estavam considerados perdidos. Não fez mágica — operou o pipeline com método.

---

## ✅ Checklist deste módulo

- [ ] Criei versão inicial do **banco de objeções** com o Prompt 1.
- [ ] Salvei **3 respostas** para as 5 objeções mais frequentes.
- [ ] Montei planilha de follow-up com data do próximo toque.
- [ ] Rodei o **Prompt 3** em 5 propostas paradas.
- [ ] Preparei **1 e-mail de fechamento** com o Prompt 4.
- [ ] Reativei **1 lead perdido** com motivo real.

---

## ⚠️ Erros comuns que você vai evitar

- Achar que objeção é rejeição.
- Responder emoção com planilha.
- Follow-up sem valor ("passando aqui").
- Cobrar em vez de conduzir.
- Desistir cedo (a média B2B fecha entre o 5º e 8º toque).
- Não anotar o motivo do "não".

---

## 🚀 Fechamento — método vence talento

Vendedor talentoso sem método fatura em ondas. Com método, fatura em curva estável — e escala. IA aqui é multiplicador: encurta o tempo, aumenta a variedade, mantém a cadência. A voz continua sua.

---

## ➡️ Próximo módulo: Processo Comercial com IA

No módulo final, você fecha o ciclo com **rotina, indicadores e pipeline sustentável** — o que transforma o aprendizado em resultado repetível, mês após mês. Nos vemos lá.
$M3$
  WHERE course_id = cid AND sort_order = 3;

  -- ============ MÓDULO 4 ============
  UPDATE public.modules SET content_text = $M4$
## Bem-vindo ao Módulo 4

Você já sabe pesquisar, abordar, conduzir objeções e fechar. Falta a parte que separa o vendedor bom do vendedor que **escala**: **processo comercial**. Rotina, indicadores e pipeline sustentável — com IA como camada de aceleração, não de dependência.

> Este módulo fecha o ciclo: você sai com um sistema comercial próprio, replicável e mensurável.

---

## 🎯 Objetivo do Módulo

- Desenhar seu **pipeline em etapas claras**, do lead frio à assinatura.
- Definir os **4 indicadores essenciais** que você vai acompanhar.
- Estabelecer **rotina semanal** de 3 blocos (pesquisa, execução, revisão).
- Usar IA para **resumo, relatório e priorização** — sem virar analista.
- Criar plano de **30/60/90 dias** para consolidar o método.

---

## Bloco 1 — O pipeline mínimo viável

Um pipeline bom tem 5 etapas claras — nem mais, nem menos:

1. **Lead** — contato identificado, ainda sem interação.
2. **Contato feito** — primeira mensagem enviada.
3. **Reunião realizada** — call de descoberta feita.
4. **Proposta enviada** — documento na mão do cliente.
5. **Fechado** — assinado ou perdido (com motivo).

Cada etapa tem **critério de entrada e saída**. Sem critério, o pipeline vira depósito.

---

## Bloco 2 — Os 4 indicadores que importam

Você não precisa de dashboard cheio. Precisa de 4 números:

- **Volume de leads na semana** (entrada).
- **Taxa de resposta** (contato → reunião).
- **Taxa de conversão** (proposta → fechado).
- **Ticket médio**.

Multiplique e você tem o resultado. Mexa em um deles e o resto se move. Simples — mas quase ninguém faz.

---

## Bloco 3 — Rotina semanal em 3 blocos

- **Segunda — Pesquisa (60 min):** Prompt 1 do Módulo 2 nos 5 leads prioritários.
- **Quarta — Execução (60 min):** abordagens novas + follow-ups em bloco.
- **Sexta — Revisão (45 min):** resumos de call, atualização do pipeline, 4 indicadores.

Total: **menos de 3 horas por semana** para operar um pipeline funcionando.

---

## Bloco 4 — Direção humana + execução assistida no processo

**Você decide:** quem entra no funil, quando avançar ou descartar, quanto investir por lead.
**A IA executa:** resumo de calls, priorização por sinais, geração de relatório semanal.

O objetivo não é virar analista de dados. É **enxergar o funil em 5 minutos** e decidir onde atuar.

---

## Bloco 5 — Prompts essenciais

**Prompt 1 — Relatório semanal do pipeline**
```
Cole aqui meu pipeline atualizado: "[lista com etapa de cada lead]".
Devolva: (1) resumo por etapa, (2) 3 leads que precisam de ação hoje,
(3) 2 leads em risco de esfriar, (4) 1 recomendação de foco da semana.
```

**Prompt 2 — Priorização de fim de dia**
```
Meus leads ativos: "[lista com última interação e etapa]".
Devolva os 5 leads que devem receber toque amanhã,
com o tipo de toque (abordagem, follow-up, proposta, fechamento)
e 1 linha justificando a prioridade.
```

**Prompt 3 — Análise de perda**
```
Perdi as seguintes vendas nos últimos 30 dias: "[cole]".
Cada uma com motivo declarado. Identifique:
(1) padrão de perda mais comum, (2) etapa onde a maioria caiu,
(3) 3 ajustes práticos no meu processo para o próximo mês.
```

---

## Bloco 6 — Plano de 30/60/90 dias

- **Dias 1-30 — Fundação:** rotina de 3 blocos rodando, 4 indicadores registrados semanalmente, biblioteca de prompts iniciada.
- **Dias 31-60 — Ajuste:** análise de perda, refinamento do banco de objeções, revisão de abordagem por segmento.
- **Dias 61-90 — Escala:** aumento controlado de volume, delegação de partes do processo, replicação do método em novos produtos ou territórios.

Não pule etapas. Escalar sem fundação é como acelerar num carro sem freio.

---

## 💡 Exemplo prático

**Camila** vende serviço de gestão financeira, ticket R$ 12k/mês. Antes: pipeline no improviso, 1 fechamento por mês. Aplicou o método:

- Etapas claras: 5.
- Rotina de 3 blocos: 3 semanas para pegar o hábito.
- Indicadores: 12 leads/semana → 4 reuniões → 1,5 propostas → 0,7 fechamentos.
- Após 60 dias: **de 1 para 3 fechamentos/mês**, sem aumentar horas trabalhadas.

Ela não vendeu mais porque virou "melhor vendedora". Vendeu mais porque **fez o mesmo processo, todas as semanas**.

---

## ✅ Checklist final

- [ ] Desenhei meu pipeline em **5 etapas** com critérios claros.
- [ ] Escolhi meus **4 indicadores** e comecei a registrar.
- [ ] Bloqueei na agenda os **3 blocos semanais** (pesquisa, execução, revisão).
- [ ] Rodei o **Prompt 1** no meu pipeline atual.
- [ ] Defini meu plano de **30/60/90 dias** por escrito.
- [ ] Organizei minha **biblioteca comercial** (prompts, objeções, mensagens que funcionaram).

---

## ⚠️ Erros comuns que você vai evitar

- Pipeline com 12 etapas — ninguém opera.
- Dashboard cheio, decisão vazia.
- Rotina sem bloco fixo — o urgente engole o importante.
- Escalar volume antes de ter processo estável.
- Usar IA para relatório bonito em vez de decisão prática.

---

## 🚀 Fechamento — de vendedor a operador comercial

Vendedor comum trabalha por impulso. Operador comercial trabalha por processo. IA aqui não substitui a decisão — ela **libera tempo** para você decidir melhor. O sistema que você monta agora é o mesmo que sustenta faturamento em ciclo bom **e** em ciclo ruim.

Boas vendas. Nos vemos em outros cursos da FCIA Academy.

---

## ➡️ Próximo passo: emissão do certificado

Complete o exame final com aproveitamento mínimo de 70% para emitir seu certificado da FCIA Academy — Venda com IA. Ele traz seu nome, ID de validação e QR verificável publicamente.
$M4$
  WHERE course_id = cid AND sort_order = 4;
END $$;
