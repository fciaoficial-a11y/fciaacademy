import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const forceRebuildModule2Premium = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabaseAdmin: supabase } = await import("@/integrations/supabase/client.server");

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) throw new Error('Curso não encontrado');

    const { data: module2 } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', course.id)
      .eq('slug', 'modulo-2-estrategia-posicionamento')
      .single();

    if (!module2) throw new Error('Módulo 2 não encontrado');

    const contentM2 = `
# Módulo 2 — Estratégia, Nicho, Público e Posicionamento

## Objetivo do Módulo
O Módulo 1 definiu a mentalidade e o mapa de oportunidade. Agora, você transformará essas decisões em uma **estratégia concreta de posicionamento**. Ao final desta aula, você terá em mãos o seu **Dossiê Estratégico**, a base obrigatória para construir a identidade visual no Módulo 3. Você deixará de ser um "criador de avatares" para se tornar um **Operador de Ativos de Conversão**.

---

## BLOCO 1 — ESTRATÉGIA ANTES DA IDENTIDADE
A maior armadilha de quem começa com IA é correr para o gerador de imagens para criar um "rosto bonito". **Pare agora.** 
Imagens, roupas e vídeos são apenas a embalagem. Se você não decidir para quem o influenciador existe e qual problema ele resolve, você terá um personagem visual, mas não um influenciador virtual lucrativo.

### A Diferença entre Personagem e Ativo de Conversão
- **Personagem Visual:** Tem estética, mas não tem propósito comercial.
- **Influenciador Virtual:** É uma marca de conteúdo desenhada para ocupar um lugar específico na mente da audiência e gerar aquisição.

---

## BLOCO 2 — DO MAPA DE NICHO À DECISÃO FINAL: MODO PROVA
Agora vamos filtrar as opções do Módulo 1 para a sua escolha definitiva. Use o **Modo PROVA** para validar seu nicho final:

- **P — Problema Demonstrável:** O benefício do produto aparece claramente no vídeo?
- **R — Recorrência:** O público precisa comprar esse tipo de produto mais de uma vez por ano?
- **O — Oportunidade Visual:** O nicho permite cenários e demonstrações magnéticas?
- **V — Viabilidade:** Você consegue gerar os prompts e encontrar produtos para este nicho?
- **A — Aderência:** O personagem, o produto e o público falam a mesma língua?

---

## BLOCO 3 — DEFINIÇÃO DE PÚBLICO PRIORITÁRIO
Esqueça definições genéricas como "mulheres de 30 anos". No TikTok Shop, focamos no **Público Prioritário** e no **Decisor**.

### Entendendo os Papéis:
1. **Público Amplo:** Quem consome o entretenimento.
2. **Decisor:** Quem tem o cartão de crédito e a dor latente.
3. **Gatilho de Confiança:** O que faz essa pessoa acreditar em um avatar de IA?

---

## BLOCO 4 — MAPA DE CONTEXTO DE COMPRA
Onde o problema aparece? O que o público sente antes de clicar?
Use o fluxo: **CENA → TENSÃO → BUSCA → PROVA → DECISÃO → AÇÃO**.

**Exemplo (Nicho Cozinha):**
- **CENA:** Marmitas derramando na bolsa.
- **TENSÃO:** Frustração e perda de dinheiro/comida.
- **BUSCA:** "Como lacrar potes de vidro?"
- **PROVA:** IV mostra o produto X virado de cabeça para baixo sem vazar.
- **AÇÃO:** Compra imediata pelo link do vídeo.

---

## BLOCO 5 — DORES, DESEJOS, OBJEÇÕES E GATILHOS
A venda é uma ponte. De um lado, a **Dor (Funcional e Emocional)**. Do outro, o **Desejo**. A ponte é sustentada pela quebra de **Objeções**.

### Objeções Comuns no TikTok Shop:
- "É golpe?" -> Responda com Gatilhos de Prova e Rastreio.
- "Funciona para mim?" -> Responda com Identificação e Demonstração.

---

## BLOCO 6 — PROPOSTA DE VALOR E POSICIONAMENTO
Chegou a hora de definir sua **Frase de Posicionamento**.
Fórmula: *“Este influenciador ajuda [PÚBLICO] a resolver [PROBLEMA] através de [MECANISMO/PRODUTO] com um tom de [PERSONALIDADE/ARQUÉTIPO].”*

---

## BLOCO 7 — CATEGORIA DE PRODUTOS E FUNÇÃO COMERCIAL
Seu influenciador será um:
1. **Apresentador Técnico:** Focado em unboxing e detalhes.
2. **Lifestyle:** Mostra o produto inserido em uma rotina invejável.
3. **Curador de Ofertas:** O "caçador de promoções" em quem todos confiam.

---

## BLOCO 8 — ARQUÉTIPO E PERSONALIDADE ESTRATÉGICA
Escolha o arquétipo que guiará a criação visual:
- **O Sábio:** Focado em dados e eficiência.
- **O Amigo:** Focado em comunidade e identificação.
- **O Criador:** Focado em inovação e estética única.

---

## BLOCO 9 — PILARES E FORMATOS DE CONTEÚDO
Defina sua matriz editorial inicial. Não poste apenas vendas.
- **Pilar 1 (Autoridade):** Dicas e hacks do nicho.
- **Pilar 2 (Desejo):** O lifestyle do influenciador.
- **Pilar 3 (Conversão):** Demonstração direta de produto com link.

---

## BLOCO 10 — BIBLIOTECA DE 20 PROMPTS AI-TO-AI
Use prompts avançados para mapear dores, desejos e objeções específicas do seu nicho:
1. *"Analise este subnicho [X] e identifique 10 dores emocionais que os grandes players estão ignorando."*
2. *"Crie uma persona detalhada para o comprador impulsivo de [PRODUTO], incluindo seus gatilhos de medo e pressa."*
3. *"Escreva uma frase de posicionamento de 15 palavras que diferencie meu IV de um vendedor de shopping."*
(Explore variações de público e objeções).

---

## BLOCO 11 — PROJETO PRÁTICO: DOSSIÊ ESTRATÉGICO
Preencha o seu Dossiê com:
- Nicho Final Justificado.
- Arquétipo Escolhido.
- Proposta de Valor.
- Matriz de 3 Pilares de Conteúdo.

---

## BLOCO 12 — CHECKLIST DE APROVAÇÃO E TRANSIÇÃO
- [ ] O nicho é visualmente demonstrável?
- [ ] A proposta de valor é clara?
- [ ] Você sabe quem é o seu Decisor?

**Fechamento:** Agora você tem um cérebro estratégico. No próximo módulo, vamos dar um corpo, um rosto e um nome para esse cérebro.
**Próximo Módulo:** Módulo 3 — Criação da Identidade do Influenciador Virtual.
`.trim();

    const { error: updateError } = await supabase
      .from('modules')
      .update({
        content_text: contentM2,
        content_type: 'text',
        video_url: null,
        duration_minutes: 45
      })
      .eq('id', module2.id);

    if (updateError) throw updateError;

    await supabase.from('questions').delete().eq('module_id', module2.id);
    
    const questions = [
      {
        module_id: module2.id,
        course_id: course.id,
        question: 'O que o modo PROVA avalia na escolha do nicho?',
        options: [
          'Preço, Rapidez, Ordem, Valor, Atenção',
          'Problema, Recorrência, Oportunidade, Viabilidade, Aderência',
          'Público, Renda, Objetivo, Venda, Alcance',
          'Posts, Reels, Orçamentos, Vídeos, Anúncios'
        ],
        correct_answer: 'Problema, Recorrência, Oportunidade, Viabilidade, Aderência',
        difficulty: 'medium',
        status: 'approved',
        type: 'multiple_choice'
      },
      {
        module_id: module2.id,
        course_id: course.id,
        question: 'Qual a principal diferença entre um "Personagem Visual" e um "Influenciador Virtual"?',
        options: [
          'O influenciador tem uma estética melhor.',
          'O influenciador é uma marca de conteúdo desenhada para conversão.',
          'O personagem visual é feito com ferramentas pagas.',
          'Não há diferença real entre eles.'
        ],
        correct_answer: 'O influenciador é uma marca de conteúdo desenhada para conversão.',
        difficulty: 'hard',
        status: 'approved',
        type: 'multiple_choice'
      }
    ];

    await supabase.from('questions').insert(questions);

    return { success: true };
  });
