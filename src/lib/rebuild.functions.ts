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
# TikTok Shop: Mentalidade e Nichos Lucrativos

## Objetivo do Módulo
Dominar a psicologia do consumo no TikTok Shop e selecionar um nicho de alta conversão para o seu Influenciador de IA, garantindo um posicionamento inabalável desde o dia zero.

## O "Mindset" do Proprietário de Avatares
Diferente de um influenciador tradicional que vende sua própria imagem, você está construindo um **Ativo de Software**. Sua mentalidade deve migrar do "Criador de Conteúdo" para o "Gestor de Portfólio de Influência". 
- **Escalabilidade:** Um avatar não se cansa.
- **Desapego:** O avatar é uma ferramenta de vendas, não uma extensão do seu ego.
- **Dados sobre Estética:** No TikTok Shop, um vídeo "feio" que segue a estrutura de retenção vende mais que um "bonito" sem estratégia.

## Por que o TikTok Shop é o Oceano Azul?
O TikTok Shop remove a "fricção de saída". 
1. **Checkout Nativo:** O usuário compra sem sair do app.
2. **Algoritmo de Interesse:** O vídeo é entregue para quem quer comprar, não apenas para seguidores.
3. **Sinergia com IA:** A IA permite produzir 10 variações de um mesmo anúncio em minutos, testando qual gancho (hook) converte mais.

## Nichos de Ouro para Avatares Virtuais
Não tente vender tudo. Foque em nichos onde a IA brilha:
- **Tecnologia & Gadgets:** Onde o visual futurista da IA valida a modernidade do produto.
- **Bem-estar & Biohacking:** Onde a IA pode representar um "ideal" de saúde inalcançável por humanos.
- **Casa Inteligente (Smart Home):** Onde a demonstração funcional é o foco principal.

## Exemplo Prático: A Regra dos 3S
Seu nicho deve ser:
1. **Específico (Specific):** Não venda "coisas de cozinha", venda "soluções para quem mora sozinho".
2. **Escalável (Scalable):** Existem milhares de produtos similares para você nunca ficar sem estoque de conteúdo.
3. **Resolvível (Solvable):** O produto resolve uma dor que pode ser mostrada visualmente em 15 segundos.

## Fechamento e Próximo Passo
Com o nicho definido, o próximo passo é a **Engenharia de Identidade**. Não adianta ter o melhor produto se o seu influenciador não transmite a autoridade necessária para o nicho escolhido.
    `.trim();

    const contentM2 = `
# Estratégia, Nicho, Público e Posicionamento

## Objetivo do Módulo
A Inteligência Artificial é apenas o pincel; você é o artista e o estrategista. No TikTok Shop, a diferença entre um vídeo que flopa e um que vende 10 mil unidades em 24h não é a qualidade do render, mas a precisão do posicionamento.

## O Triângulo de Ouro do Posicionamento
Para um influenciador de IA ser lucrativo, ele deve habitar a intersecção de três pilares:
1. **Nicho de Alta Frequência:** Produtos que as pessoas compram repetidamente (skincare, gadgets, suplementos).
2. **Autoridade Visual:** A aparência do influenciador deve validar o produto (ex: uma IA "cientista" para vender suplementos técnicos).
3. **Público de Impulso:** Usuários que buscam solução imediata para dores cotidianas.

## Na Prática: A Regra do Problema Visível
Evite nichos abstratos. Escolha produtos onde o benefício é visível na tela:
- **Limpeza:** O antes e depois é instantâneo.
- **Beleza:** O efeito do produto no rosto é imediato.
- **Organização:** A transformação do caos em ordem é viciante de assistir.

## Erros Comuns no Posicionamento
- **Ser Genérico:** Tentar agradar todo mundo e acabar não sendo lembrado por ninguém.
- **IA Camaleão:** Mudar a personalidade ou o tom de voz dependendo do post.
- **Focar no Ego:** Criar um influenciador para "ser famoso" em vez de criar um para "resolver problemas".

## Fechamento: A Mente por Trás da Máquina
O seu posicionamento estratégico é o que define a "alma comercial" do seu influenciador virtual. Sem isso, você é apenas mais um no feed.
    `.trim();

    const contentM3 = `
# Criação da Identidade do Influenciador Virtual

## Objetivo do Módulo
Saia do "boneco de IA" e crie uma persona magnética que as pessoas realmente queiram seguir, definindo o DNA psicológico e visual do seu influenciador.

## O DNA do Influenciador (The Soul)
A maioria dos iniciantes comete o erro de focar 100% no visual e 0% na personalidade. Antes de abrir o gerador de imagens, definimos:
- **Origem:** Onde ele(a) mora? Qual sua história?
- **Valores:** O que ele(a) defende? (Ex: Sustentabilidade, Luxo Acessível).
- **Hobbies:** O que ele faz quando não está "vendendo"? Isso humaniza o perfil.

## Exemplo Prático: A Estética Identitária
A consistência visual gera confiança.
- **Traços Marcantes:** Uma cicatriz, um estilo de óculos, uma cor de cabelo específica. Algo que o cérebro do seguidor identifique em 0.5 segundos.
- **O Cenário Padrão:** Onde esse influenciador vive? Seu "estúdio" ou "casa" deve ter uma paleta de cores consistente.

## Na Prática: Tone of Voice
Como seu influenciador escreve?
- **Formalidade:** Ele usa gírias? É sarcástico?
- **Emojis:** Defina um conjunto de 3-5 emojis que ele usa sempre para criar padrão visual.

## Fechamento: O Curador de Confiança
No TikTok Shop, o influenciador atua como um "Curador de Confiança". A identidade sólida é a sua âncora para toda a geração de conteúdo futuro.
    `.trim();

    const contentM4 = `
# Consistência Visual e Ficha Técnica

## Objetivo do Módulo
Dominar as técnicas de "Seed" e "Reference" para garantir que seu influenciador tenha o mesmo rosto, corpo e aura em todas as postagens.

## O Problema da IA Camaleão
O erro número 1 é postar fotos onde o influenciador parece uma pessoa diferente a cada post. Se o rosto muda 5%, o cérebro do seguidor grita "FAKE" e a venda é perdida.

## A Ficha Técnica (O Guia de Estilo)
Você deve seguir um manual contendo:
- **Seed Master:** O número de semente original.
- **Prompt de Rosto Fixo:** A descrição exata das características faciais.
- **Paleta de Materiais:** As texturas e tecidos recorrentes.

## Na Prática: Character Reference (--cref)
Use imagens de referência para manter o personagem estável em diferentes cenários.
- **Biblioteca de Ambientes:** Defina cenários fixos para manter a iluminação consistente.
- **Prompt de Exemplo:** "Character portrait of a [PERSONAGEM], wearings [VESTIMENTA], --cref [URL] --cw 100".

## Fechamento: O Fim da IA Camaleão
A consistência visual permite que você faça "Unboxing" de produtos diferentes sem que pareça propaganda aleatória. O influenciador se torna o apresentador oficial da sua vitrine.
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
        await supabase.from('questions').insert([
          {
            module_id: mod.id,
            course_id: courseId,
            question: `Qual o pilar fundamental do Módulo: ${up.title}?`,
            options: ['Estratégia e Dados', 'Apenas Estética', 'Sorte', 'Volume sem foco'],
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
