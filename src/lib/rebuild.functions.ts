
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

    // 1. Garantir que Módulos 1 e 2 existam
    const modulesToEnsure = [
      { sort_order: 1, title: "MÓDULO 1 — TikTok Shop: O Oceano Azul da Monetização", slug: "modulo-1-mentalidade-nichos" },
      { sort_order: 2, title: "MÓDULO 2 — Branding e Posicionamento do Influenciador", slug: "modulo-2-estrategia-posicionamento" }
    ];

    for (const m of modulesToEnsure) {
      const { data: existing } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('sort_order', m.sort_order)
        .maybeSingle();

      if (!existing) {
        await supabase.from('modules').insert({
          course_id: courseId,
          sort_order: m.sort_order,
          title: m.title,
          slug: m.slug,
          content_type: 'text',
          duration_minutes: 30
        });
      }
    }

    // 2. Conteúdos
    const contentM1 = `
# Módulo 1: TikTok Shop — Mentalidade e Nichos Lucrativos

## 1. O Mindset do "Puppet Master"
Entenda que você não é um criador de conteúdo comum; você é um estrategista que controla ativos digitais. O TikTok Shop em 2026 não recompensa apenas a estética, mas a consistência de vendas.

## 2. Por que Influenciadores de IA?
- **Escalabilidade Infinita:** Sua IA não cansa, não fica doente e pode gravar 50 unboxings por dia.
- **Custo Zero de Produção Física:** Sem necessidade de estúdios caros ou câmeras 4k.
- **Controle Total da Marca:** Você decide o tom, o estilo e o nicho sem depender do humor de um humano.

## 3. Os 3 Pilares do Sucesso no TikTok Shop
1. **Curadoria de Produtos:** Venda o que resolve problemas, não o que é "bonitinho".
2. **Retenção de Avatar:** A primeira impressão (3 segundos) é 90% visual da IA.
3. **Conversão Psicológica:** O uso de gatilhos mentais no roteiro.

## 4. Nichos de Ouro para Avatares Virtuais
- **Tech & Gadgets:** Perfeito para IAs futuristas e cleans.
- **Home & Decor:** Avatares que transmitem conforto e sofisticação.
- **Pets & Kids:** Avatares lúdicos que geram empatia imediata.
- **Self-Care & Estética:** Avatares com pele perfeita (gerada por IA) para vender skincare.

## 5. Exercício Prático
Defina seu nicho primário e crie uma lista de 5 produtos "vencedores" que sua IA poderia anunciar hoje.
    `.trim();

    const contentM2 = `
# Módulo 2: Estratégia, Nicho, Público e Posicionamento

## 1. O Triângulo de Ouro do Posicionamento
Para ser lucrativo, seu influenciador precisa de:
- **Autoridade:** Por que o público deve ouvir sua IA?
- **Identidade:** Qual o "tempero" único dela?
- **Nicho:** Quem exatamente ela está tentando convencer?

## 2. Construindo a Persona Estratégica
Não crie apenas um "rosto bonito". Crie uma história.
- **Exemplo:** "Sofia, 28 anos, ex-arquiteta que agora vive viajando e testando gadgets de produtividade." 
Essa biografia dita o tom de voz e os produtos que ela vende.

## 3. Mapeamento de Público-Alvo
- Quais as dores do seu seguidor?
- Qual o desejo aspiracional dele?
- Como sua IA se encaixa na rotina desse seguidor?

## 4. Diferenciação Visual e Narrativa
No mar de IAs genéricas, o que faz a sua ser especial?
- Pode ser um sotaque específico.
- Um estilo de edição acelerado.
- Um cenário recorrente inconfundível.

## 5. Atividade Principal
Escreva o "Manifesto da Persona" da sua IA. Quem é ela e o que ela defende?
    `.trim();

    const contentM4 = `
# Módulo 4: Consistência Visual, Ficha Técnica e Biblioteca de Identidade

## 1. O Fim da "IA Camaleão"
O erro fatal é postar fotos onde o rosto da IA muda 5% a cada post. Isso quebra a confiança instantaneamente.

## 2. Character Reference (--cref)
Aprenda a usar a técnica de referência de personagem para manter os traços faciais, estrutura óssea e aura idênticos em qualquer cenário ou vestimenta.

## 3. A Ficha Técnica do Influenciador
Documento obrigatório que contém:
- **Seed Mestra:** A semente original da geração.
- **Prompts de Rosto Fixo:** A descrição física detalhada.
- **Paleta de Cores da Marca:** Tons que a IA sempre usa.

## 4. Biblioteca de Ambientes e Iluminação
Mantenha a iluminação consistente. Se sua IA é "Solar e Enérgica", ela não deve aparecer em ambientes escuros e melancólicos sem uma razão estratégica.

## 5. Atividade Prática
Gere 3 imagens da sua IA em situações diferentes (ex: lendo um livro, na rua, no escritório) garantindo que o rosto seja 100% reconhecível.
    `.trim();

    // 3. Atualizar cada módulo
    const updates = [
      { sort_order: 1, content: contentM1, title: "MÓDULO 1 — O Oceano Azul da Monetização" },
      { sort_order: 2, content: contentM2, title: "MÓDULO 2 — Estratégia e Posicionamento" },
      { sort_order: 4, content: contentM4, title: "MÓDULO 4 — Consistência Visual e Ficha Técnica" }
    ];

    for (const up of updates) {
      const { data: mod } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('sort_order', up.sort_order)
        .maybeSingle();

      if (mod) {
        await supabase.from('modules').update({
          content_text: up.content,
          title: up.title,
          content_type: 'text',
          video_url: null
        }).eq('id', mod.id);

        // Limpar e reinserir perguntas
        await supabase.from('questions').delete().eq('module_id', mod.id);
        
        await supabase.from('questions').insert([
          {
            module_id: mod.id,
            course_id: courseId,
            question: `Qual o foco principal do Módulo ${up.sort_order}?`,
            options: ['Estratégia e Dados', 'Apenas Estética', 'Sorte', 'Quantidade'],
            correct_answer: 'Estratégia e Dados',
            difficulty: 'medium',
            status: 'approved',
            type: 'multiple_choice'
          }
        ]);
      }
    }

    return { success: true };
  });

export const forceRebuildMod4 = createServerFn({ method: "POST" })
  .handler(async () => {
     // Mantido por retrocompatibilidade se necessário, mas redireciona para o novo
     return forceRebuildAllModules();
  });
