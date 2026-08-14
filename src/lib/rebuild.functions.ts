import { createServerFn } from "@tanstack/react-start";
import { contentM3Premium, questionsM3 } from "./rebuild-m3.functions.ts";
import { contentM4Premium, questionsM4 } from "./rebuild-m4.functions.ts";

export const forceRebuildAllModules = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabaseAdmin: supabase } = await import("@/integrations/supabase/client.server");


    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) throw new Error('Course not found');
    const courseId = course.id;

    // 1. Definição de Conteúdos Premium (Markdown Purista para ModuleArticle)
    
    const contentM1 = `
# Módulo 1 — Mentalidade e Nichos Lucrativos

## BLOCO 1 — A NOVA LÓGICA DO INFLUENCIADOR VIRTUAL
O Influenciador Virtual (IV) é um Ativo de Software Programável. Diferente de um humano, ele oferece escalabilidade infinita, controle total da narrativa e eficiência de custo. No TikTok Shop, ele atua como Mídia, Personagem, Apresentador e Vendedor. A aparência sem estratégia é inútil; o IV deve ser uma embalagem estratégica para conversão.

## BLOCO 2 — COMO FUNCIONA O TIKTOK SHOP
O TikTok Shop é um sistema de descoberta impulsiva. A jornada inclui Descoberta, Interesse, Consideração, Confiança e Ação. O conteúdo deve ser nativo e orgânico, agindo como um "conselho de quem já usou" em um contexto real.

## BLOCO 3 — MENTALIDADE DO OPERADOR DE AVATARES
Você é um Diretor de Operações de Conteúdo. 
### MÉTODO DOS 5 ATIVOS
1. Identidade (DNA visual e psicológico)
2. Conteúdo (esteira de scripts e cenários)
3. Produto (curadoria baseada em margem e demonstração)
4. Distribuição (estratégia de algoritmo)
5. Análise (estudo frio de métricas)

## BLOCO 4 — NICHO, SUBNICHO E MICRONIC
A riqueza está no nicho. Exemplo: Mercado Amplo (Casa) > Nicho (Organização) > Subnicho (Cozinha) > Micronic (Geladeiras para marmitas semanais). Escolha um micronic onde o problema seja visualmente demonstrável.

## BLOCO 5 — CRITÉRIOS DE UM NICHO COM POTENCIAL
Use a MATRIZ DE PONTUAÇÃO DO NICHO (15 mandamentos). Avalie volume de problemas, variedade de SKUs, interesse visual e recorrência. Se a pontuação for baixa, o nicho é rejeitado.

## BLOCO 6 — PÚBLICO, PERSONA E CONTEXTO DE COMPRA
Foque em Contextos de Necessidade, não em demografia vazia. Mapeie a situação de uso, o problema antes da compra e o desejo após a resolução.

## BLOCO 7 — DORES, DESEJOS E OBJEÇÕES
MÉTODO MESTRE: DOR → CENA → PRODUTO → DEMONSTRAÇÃO → BENEFÍCIO → AÇÃO. Este roteiro é a base de todo vídeo que converte visualização em venda imediata.

## BLOCO 8 — BIBLIOTECA DE 15 PROMPTS AI-TO-AI
Use a IA para planejar sua IA. Prompts de Análise de Nicho, Psicologia Profunda, Mapeamento de Dores, Gerador de Ganchos e Engenharia de Objeções.

## BLOCO 9 — CHECKLIST E MATERIAIS COMPLEMENTARES
Checklist de início e materiais de apoio: Matriz de Pontuação, Tabela de Comissões e Moodboards de referências visuais.

## FECHAMENTO E TRANSIÇÃO
Você construiu a base estratégica. Sem um nicho claro, você é apenas um amador. No próximo módulo, daremos um rosto e uma alma para sua operação: Engenharia de Identidade e Consistência Visual.
`.trim();

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

---

## BLOCO 4 — MAPA DE CONTEXTO DE COMPRA
Onde o problema aparece? O que o público sente antes de clicar?
Use o fluxo: **CENA → TENSÃO → BUSCA → PROVA → DECISÃO → AÇÃO**.

---

## BLOCO 5 — DORES, DESEJOS, OBJEÇÕES E GATILHOS
A venda é uma ponte. De um lado, a **Dor (Funcional e Emocional)**. Do outro, o **Desejo**. A ponte é sustentada pela quebra de **Objeções**.

---

## BLOCO 6 — PROPOSTA DE VALOR E POSICIONAMENTO
Chegou a hora de definir sua **Frase de Posicionamento**.
Fórmula: *“Este influenciador ajuda [PÚBLICO] a resolver [PROBLEMA] através de [MECANISMO/PRODUTO] com um tom de [PERSONALIDADE/ARQUÉTIPO].”*

---

## BLOCO 7 — CATEGORIA DE PRODUTOS E FUNÇÃO COMERCIAL
Seu influenciador será um Apresentador Técnico, Lifestyle ou Curador de Ofertas.

---

## BLOCO 8 — ARQUÉTIPO E PERSONALIDADE ESTRATÉGICA
Escolha o arquétipo que guiará a criação visual: O Sábio, O Amigo ou O Criador.

---

## BLOCO 9 — PILARES E FORMATOS DE CONTEÚDO
Defina sua matriz editorial inicial: Autoridade, Desejo e Conversão.

---

## BLOCO 10 — BIBLIOTECA DE 20 PROMPTS AI-TO-AI
Use prompts avançados para mapear dores, desejos e objeções específicas do seu nicho.

---

## BLOCO 11 — PROJETO PRÁTICO: DOSSIÊ ESTRATÉGICO
Preencha o seu Dossiê com o nicho final, arquétipo, proposta de valor e pilares.

---

## BLOCO 12 — CHECKLIST DE APROVAÇÃO E TRANSIÇÃO
- [ ] O nicho é visualmente demonstrável?
- [ ] A proposta de valor é clara?

**Fechamento:** Agora você tem um cérebro estratégico. No próximo módulo, vamos dar um corpo para esse cérebro.
`.trim();

    const contentM3 = `
# Criação da Identidade do Influenciador Virtual

## Objetivo do Módulo
Saia do "boneco de IA" e crie uma persona magnética que as pessoas realmente queiram seguir, definindo o DNA psicológico e visual do seu influenciador.

## O DNA do Influenciador (The Soul)
A maioria dos iniciantes comete o erro de focar 100% no visual e 0% na personalidade. Antes de abrir o gerador de imagens, definimos:
- **Origem e Valores:** O que ele defende? Qual sua história?
- **Hobbies e Tom de Voz:** O que ele faz quando não está vendendo? Como ele fala?

## Exemplo Prático: A Estética Identitária
A consistência visual gera confiança.
- **Traços Marcantes:** Cicatrizes, óculos, cores específicas.
- **O Cenário Padrão:** Onde esse influenciador vive?

## Fechamento: O Curador de Confiança
No TikTok Shop, o influenciador atua como um "Curador de Confiança". A identidade sólida é a sua âncora para toda a geração de conteúdo futuro.
`.trim();

    const contentM4 = contentM4Premium;

    // 2. Mapeamento e Execução
    const updates = [
      { slug: 'influenciador-ia-m1', content: contentM1, title: 'Módulo 1: Mentalidade e Nichos Lucrativos' },
      { slug: 'modulo-2-estrategia-posicionamento', content: contentM2, title: 'Módulo 2: Estratégia e Posicionamento' },
      { slug: 'influenciador-ia-m3', content: contentM3Premium, title: 'Módulo 3: Criação da Identidade do Influenciador' },
      { slug: 'influenciador-ia-m4', content: contentM4, title: 'Módulo 4: Consistência Visual' }
    ];

    for (const up of updates) {
      const { data: mod } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('slug', up.slug)
        .maybeSingle();

      if (mod) {
        await supabase.from('modules').update({
          content_text: up.content,
          title: up.title,
          content_type: 'text',
          video_url: null
        }).eq('id', mod.id);

        // Atualizar Questões para o novo conteúdo
        await supabase.from('questions').delete().eq('module_id', mod.id);
        
        const newQuestions = [
          {
            module_id: mod.id,
            course_id: courseId,
            question: up.slug === 'influenciador-ia-m1' ? 'Qual a principal diferença entre um influenciador real e um virtual?' : `Qual o foco principal do Módulo: ${up.title}?`,
            options: up.slug === 'influenciador-ia-m1' 
              ? ['O virtual é um ativo de software escalável', 'O virtual não precisa de estratégia', 'O real é sempre mais barato', 'Não há diferença']
              : ['Estratégia e Dados', 'Apenas Estética', 'Sorte', 'Volume sem foco'],
            correct_answer: up.slug === 'influenciador-ia-m1' ? 'O virtual é um ativo de software escalável' : 'Estratégia e Dados',
            difficulty: 'medium',
            status: 'approved',
            type: 'multiple_choice'
          }
        ];

        // Se for M1, adicionar mais questões para densidade
        if (up.slug === 'influenciador-ia-m1') {
          newQuestions.push({
            module_id: mod.id,
            course_id: courseId,
            question: 'O que caracteriza a Regra dos 3S para escolha de nicho?',
            options: ['Specific, Scalable, Solvable', 'Simple, Sweet, Short', 'Search, Select, Send', 'Social, Small, Smart'],
            correct_answer: 'Specific, Scalable, Solvable',
            difficulty: 'hard',
            status: 'approved',
            type: 'multiple_choice'
          });
        }

        // Se for M3, injetar questões premium
        if (up.slug === 'influenciador-ia-m3') {
          questionsM3.forEach(q => {
            newQuestions.push({
              module_id: mod.id,
              course_id: courseId,
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              difficulty: q.difficulty as any,
              status: 'approved',
              type: 'multiple_choice'
            });
          });
        }

        // Se for M4, injetar questões premium
        if (up.slug === 'influenciador-ia-m4') {
          questionsM4.forEach(q => {
            newQuestions.push({
              module_id: mod.id,
              course_id: courseId,
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              difficulty: q.difficulty as any,
              status: 'approved',
              type: 'multiple_choice'
            });
          });
        }


        await supabase.from('questions').insert(newQuestions);
      }
    }

    return { success: true };
  });
