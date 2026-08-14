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
Ao concluir este módulo, você será capaz de compreender a lógica comercial por trás dos influenciadores virtuais no TikTok Shop, identificar nichos de alta lucratividade e construir uma base estratégica sólida para sua operação. O objetivo não é apenas criar um personagem, mas gerenciar um ativo comercial escalável.

## Bloco 1 — A Nova Lógica do Influenciador Virtual

O mercado de influência está mudando. Enquanto influenciadores tradicionais são limitados pelo tempo, cansaço e agenda, o **Influenciador Virtual** é um ativo de software disponível 24/7. 

**Influenciador Tradicional vs. Virtual:**
No modelo tradicional, o rosto é o produto. No modelo virtual, o rosto é a interface de um sistema de vendas. A aparência sem estratégia não gera negócio; o que converte é a autoridade percebida e a utilidade demonstrada.

**Funções do Influenciador Virtual:**
1. **Mídia:** Ele é o veículo de anúncios.
2. **Personagem:** Ele gera conexão e narrativa.
3. **Apresentador:** Ele demonstra funcionalidades de produtos.
4. **Vendedor:** Ele faz a oferta direta e quebra objeções.

**Exemplo de Ativo Comercial vs. Personagem Vazio:**
Imagine um avatar ultra-realista que apenas posta fotos bonitas em Dubai. Isso é um personagem, mas não é um ativo comercial. Agora imagine um avatar "técnico", que usa óculos, vive em um cenário de tecnologia e faz unboxings detalhados de gadgets domésticos. O segundo é um ativo de venda porque tem uma **função estratégica** clara.

**Exercício de Diagnóstico:**
Olhe para os avatares de IA que você vê no Instagram ou TikTok. Eles estão tentando ser famosos ou estão tentando vender algo? Identifique 3 que possuem uma função comercial clara.

---

## Bloco 2 — Como funciona o TikTok Shop

O TikTok Shop é uma revolução porque une o entretenimento à transação imediata. Diferente do Instagram, onde você clica em um link na bio e sai do app, no TikTok Shop a compra acontece dentro do fluxo de atenção do usuário.

**A Jornada da Audiência:**
1. **Descoberta:** O algoritmo entrega seu vídeo para alguém que nem te segue, mas tem interesse no produto.
2. **Interesse:** O conteúdo de entretenimento ou utilidade segura o usuário nos primeiros 3 segundos.
3. **Consideração:** A demonstração honesta e visual do produto quebra a dúvida.
4. **Ação:** O botão de compra está a um clique de distância.

**Conteúdo vs. Venda:**
O maior erro é fazer um comercial de TV. O TikTok exige "Criativos Nativos". Isso significa que o seu influenciador deve parecer um usuário comum recomendando algo que realmente funciona, e não um robô gritando "compre agora".

**Mapa de Contexto:**
- **Vídeo Fraco:** "Este aspirador é ótimo, custa 100 reais, link na bio".
- **Vídeo Comercial (Correto):** "Eu não aguentava mais os pelos do meu gato no sofá. Testei 5 aspiradores e este foi o único que realmente puxou tudo sem travar. Veja a diferença aqui no tecido..."

---

## Bloco 3 — Mentalidade do Operador de Avatares

Você não é um "artista de IA". Você é um **Operador de Sistema**. Para ter sucesso, você precisa de consistência, produção em série e análise de dados.

### Método dos 5 Ativos:
1. **Identidade:** O DNA visual e psicológico do personagem.
2. **Conteúdo:** A esteira de produção de vídeos (scripts, narração, edição).
3. **Produto:** A curadoria do que será vendido (margem, demanda, recorrência).
4. **Distribuição:** A postagem estratégica e o uso do algoritmo.
5. **Análise:** O estudo das métricas (CTR, Retenção, Conversão).

**A Biblioteca de Ativos:**
Não crie cada vídeo do zero. Construa uma biblioteca de cenários, roupas e expressões do seu avatar. Isso permite que você produza 10 vídeos por dia com a mesma qualidade de um vídeo produzido em horas.

---

## Bloco 4 — Nicho, Subnicho e Micronic

Para vender, você precisa ser específico. Quem tenta vender para todo mundo não vende para ninguém.

**A Hierarquia da Especificidade:**
- **Mercado Amplo:** Beleza.
- **Nicho:** Skincare.
- **Subnicho:** Skincare para pele madura (acima de 45 anos).
- **Micronic:** Rotina de 5 minutos para mulheres executivas com pele sensível.

**Exemplos por Áreas:**
1. **Tecnologia:** Gadgets para Home Office minimalista.
2. **Bem-estar:** Suplementação para foco e produtividade (Nootrópicos).
3. **Organização:** Cozinha pequena e funcional (soluções de espaço).
4. **Moda:** Acessórios masculinos para estilo "Old Money".
5. **Pets:** Soluções de tecnologia para cães que ficam sozinhos em casa.

**Exercício:**
Escolha um Mercado Amplo e desça até o Micronic seguindo a lógica acima. Qual o problema demonstrável desse Micronic?

---

## Bloco 5 — Critérios de um Nicho com Potencial

Não escolha um nicho apenas porque você gosta. Escolha porque ele é lucrativo.

### Matriz de Pontuação do Nicho (1 a 5):
- **Volume de Problemas:** O público tem muitas dores?
- **Variedade de Produtos:** Existem muitos produtos diferentes para vender?
- **Interesse Visual:** O nicho permite vídeos bonitos e magnéticos?
- **Recorrência:** O cliente compra mais de uma vez?
- **Facilidade de Demonstração:** É fácil mostrar o produto funcionando em 15 segundos?

**Nicho Aprovado (Exemplo):** Acessórios para Setup Gamer. Pontuação alta em interesse visual e variedade de produtos.
**Nicho Rejeitado (Exemplo):** Consultoria jurídica especializada. Pontuação baixíssima em interesse visual e facilidade de demonstração via influenciador virtual.

---

## Bloco 6 — Público, Persona e Contexto de Compra

Esqueça dados demográficos vazios (Mulher, 30 anos, SP). Foque no **Contexto**.

**O Mapa de Contexto:**
- **Situação de Uso:** Onde o produto é usado? (Ex: No carro, durante o banho, no escritório).
- **Problema Antes:** O que está incomodando o usuário AGORA?
- **Desejo Depois:** Como ele se sente após resolver o problema?
- **Objeção de Confiança:** Por que ele teria medo de comprar de uma IA? (Resolva isso com provas sociais e detalhes técnicos).

**Ficha de Persona Real:**
Não chame de "Ana". Chame de "A Mãe Cansada que quer 10 minutos de paz". O que ela pesquisa às 23h no TikTok? Quais são as dores que ela não conta para ninguém?

---

## Bloco 7 — Dores, Desejos e Objeções

A venda acontece na quebra de objeções e no estímulo do desejo emocional.

**Tipos de Dores:**
- **Funcional:** "Meu cabelo está caindo".
- **Emocional:** "Tenho vergonha de sair em fotos".
- **Social:** "Meus amigos vão notar minha calvície".

### Método: DOR → CENA → PRODUTO → DEMONSTRAÇÃO → AÇÃO
1. **Dor:** Cansado de acordar com dor nas costas.
2. **Cena:** O influenciador virtual sentado na beira da cama, com cara de sono, massageando a lombar.
3. **Produto:** Um corretor postural magnético.
4. **Demonstração:** Mostra o avatar usando o produto por baixo da camisa e ficando com a postura reta instantaneamente.
5. **Ação:** Clique no link abaixo para o desconto de lançamento.

---

## Bloco 8 — Biblioteca de Prompts AI-to-AI

Use a IA para planejar a sua IA. Aqui estão prompts para você usar no ChatGPT ou Gemini:

1. **Prompt de Personagem:** "Crie uma ficha psicológica para um influenciador virtual de 28 anos, especialista em organização doméstica, que usa um tom sarcástico, porém útil."
2. **Prompt de Nicho:** "Liste 10 micronics no nicho de pets que possuem produtos com preço entre R$ 50 e R$ 150 no AliExpress."
3. **Prompt de Gancho (Hook):** "Crie 5 variações de gancho de 3 segundos para um vídeo sobre um carregador solar portátil."
4. **Prompt de Script:** "Escreva um roteiro de 30 segundos usando o método DOR-CENA-PRODUTO para um gadget de cozinha."
5. **Prompt de Objeções:** "Quais são as 5 principais dúvidas de quem compra um smartwatch chinês pela primeira vez?"

(Estes são apenas 5 dos 15 prompts que você deve testar durante esta semana).

---

## Bloco 9 — Checklist e Materiais Complementares

**Checklist de Início:**
- [ ] Nicho definido com micronic claro.
- [ ] Problema principal mapeado.
- [ ] 3 concorrentes (humanos ou IAs) identificados.
- [ ] 10 produtos potenciais listados.
- [ ] Perfil psicológico do avatar rascunhado.

**Materiais de Apoio:**
- PDF: Tabela de Comissões Médias por Categoria.
- Link: Biblioteca de Anúncios do TikTok (para espionar o que vende).
- Vídeo Auxiliar: Como encontrar produtos virais no TikTok.

---

## Fechamento e Transição

Você acaba de concluir a base estratégica. Sem um nicho e um público claro, você seria apenas alguém brincando com ferramentas de imagem. Agora que você sabe **PARA QUEM** e **O QUE** vai vender, o próximo módulo será sobre **COMO** dar vida a esse influenciador: a Engenharia de Identidade e Consistência Visual.

**Próximo Módulo:** Criação da Identidade e DNA do Influenciador.
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
