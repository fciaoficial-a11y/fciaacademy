import { createServerFn } from "@tanstack/react-start";

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
O mercado de influência tradicional está saturado e limitado pela fisiologia humana. O Influenciador Virtual (IV) é um ativo de software programável. A aparência sem estratégia não gera negócio. No TikTok Shop, o IV atua como Mídia, Personagem, Apresentador e Vendedor.

### Ativo Comercial vs. Personagem Visual
Um personagem bonito sem função é apenas "arte". Um IV com função estratégica é "negócio". O IV deve ser visto como um apresentador de televendas 2.0 nativo do TikTok.

## BLOCO 2 — COMO FUNCIONA O TIKTOK SHOP
O TikTok Shop é um sistema de descoberta impulsiva. A jornada inclui: Descoberta, Interesse, Consideração, Confiança e Ação. Vídeos devem parecer conselhos de quem já usou, inseridos em um contexto real.

## BLOCO 3 — MENTALIDADE DO OPERADOR DE AVATARES
Você é um Diretor de Operações de Conteúdo. 
### MÉTODO DOS 5 ATIVOS
1. Identidade (DNA do IV)
2. Conteúdo (scripts e cenários)
3. Produto (curadoria e margem)
4. Distribuição (estratégia de postagem)
5. Análise (métricas de conversão)

## BLOCO 4 — NICHO, SUBNICHO E MICRONIC
A riqueza está no nicho. Exemplo: Casa > Organização > Cozinha > Organização de geladeiras para marmitas semanais.

## BLOCO 5 — CRITÉRIOS DE UM NICHO COM POTENCIAL
Avalie via MATRIZ DE PONTUAÇÃO DO NICHO (15 mandamentos). Se o nicho não for demonstrável visualmente, ele não serve para o TikTok Shop.

## BLOCO 6 — PÚBLICO, PERSONA E CONTEXTO DE COMPRA
Foque em Contextos de Necessidade, não apenas em dados demográficos. Mapeie a dor antes e o desejo depois da compra.

## BLOCO 7 — DORES, DESEJOS E OBJEÇÕES
MÉTODO: DOR → CENA → PRODUTO → DEMONSTRAÇÃO → BENEFÍCIO → AÇÃO. Este é o roteiro mestre para converter visualização em venda.

## BLOCO 8 — BIBLIOTECA DE 15 PROMPTS AI-TO-AI
Use a IA para planejar sua IA. Prompts para Análise de Nicho, Psicologia do IV, Mapeamento de Dores, Gerador de Ganchos e Roteiros DOR-CENA.

## BLOCO 9 — CHECKLIST E MATERIAIS COMPLEMENTARES
Checklist de aprovação obrigatória e materiais de apoio (Matriz de Pontuação, Glossário e Template de Ficha de Identidade).

## FECHAMENTO E TRANSIÇÃO
Você construiu a base estratégica. No próximo módulo, daremos um rosto e uma alma para sua operação: Engenharia de Identidade e Consistência Visual.
`.trim();

    const contentM2 = `
# Estratégia, Nicho, Público e Posicionamento

## Objetivo do Módulo
A Inteligência Artificial é apenas o pincel; você é o artista e o estrategista. No TikTok Shop, a diferença entre um vídeo que flopa e um que vende 10 mil unidades em 24h não é a qualidade do render, mas a precisão do posicionamento.

## O Triângulo de Ouro do Posicionamento
Para um influenciador de IA ser lucrativo, ele deve habitar a intersecção de três pilares:
1. **Nicho de Alta Frequência:** Produtos que as pessoas compram repetidamente.
2. **Autoridade Visual:** A aparência do influenciador deve validar o produto.
3. **Público de Impulso:** Usuários que buscam solução imediata.

## Na Prática: A Regra do Problema Visível
Evite nichos abstratos. Escolha produtos onde o benefício é visível na tela:
- **Limpeza:** O antes e depois é instantâneo.
- **Beleza:** O efeito do produto no rosto é imediato.
- **Organização:** A transformação do caos em ordem é viciante de assistir.

## Fechamento: A Mente por Trás da Máquina
O seu posicionamento estratégico é o que define a "alma comercial" do seu influenciador virtual. Sem isso, você é apenas mais um no feed.
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

    const contentM4 = `
# Consistência Visual e Ficha Técnica

## Objetivo do Módulo
Dominar as técnicas de "Seed" e "Reference" para garantir que seu influenciador tenha o mesmo rosto, corpo e aura em todas as postagens.

## O Problema da IA Camaleão
O erro número 1 é postar fotos onde o influenciador parece uma pessoa diferente a cada post. Se o rosto muda, a confiança morre.

## A Ficha Técnica (O Guia de Estilo)
Você deve seguir um manual contendo:
- **Seed Master:** O número de semente original.
- **Prompt de Rosto Fixo:** A descrição exata das características faciais.
- **Character Reference (--cref):** O uso de imagens de referência para estabilidade.

## Fechamento: O Fim da IA Camaleão
A consistência visual permite que você faça "Unboxing" de produtos diferentes sem que pareça propaganda aleatória.
`.trim();

    // 2. Mapeamento e Execução
    const updates = [
      { slug: 'influenciador-ia-m1', content: contentM1, title: 'Módulo 1: Mentalidade e Nichos Lucrativos' },
      { slug: 'modulo-2-estrategia-posicionamento', content: contentM2, title: 'Módulo 2: Estratégia e Posicionamento' },
      { slug: 'influenciador-ia-m3', content: contentM3, title: 'Módulo 3: Identidade do Influenciador' },
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

        await supabase.from('questions').insert(newQuestions);
      }
    }

    return { success: true };
  });
