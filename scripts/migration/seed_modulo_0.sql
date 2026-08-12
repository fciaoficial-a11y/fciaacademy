-- Iniciar transação
BEGIN;

-- Variáveis de contexto:
-- Course ID (influenciador-ia-tiktok-shop): e23cf598-23be-4dbe-b8f0-4c3a420d9b62

DO $$
DECLARE
    v_module_id UUID;
BEGIN
    -- 1. Criar o Módulo 0 na tabela public.modules
    INSERT INTO public.modules (
        course_id, 
        slug,
        title, 
        description, 
        sort_order, 
        is_published,
        content_type,
        duration_minutes,
        video_url,
        content_text,
        complementary_content
    ) VALUES (
        'e23cf598-23be-4dbe-b8f0-4c3a420d9b62',
        'modulo-0-boas-vindas',
        'Módulo 0 — Boas-vindas, Visão Geral e Método do Curso',
        'Prepare-se para sua jornada como Influenciador de IA. Conheça o método, a transformação prometida e a estrutura dos 13 módulos pedagógicos.',
        0,
        false, -- Mantendo em standby
        'video',
        25,
        'https://www.youtube.com/embed/placeholder-fernando-cabral',
        -- CONTEÚDO DA AULA PRINCIPAL (Markdown denso)
        '# Aula Principal: A Nova Era dos Influenciadores de IA no TikTok Shop

Seja bem-vindo à fronteira da criação de conteúdo digital. Neste curso, você não aprenderá apenas a usar ferramentas; você aprenderá a construir um império de influência escalável, utilizando Inteligência Artificial para superar as barreiras de tempo, custo e produção tradicionais.

## 1. O Conceito de Influenciador Virtual com IA
Um influenciador virtual não é apenas uma imagem gerada por computador. É um ativo estratégico. Diferente de um influenciador humano, o avatar de IA:
- Pode estar em múltiplos lugares ao mesmo tempo.
- Não envelhece (a menos que você queira).
- Possui consistência estética inabalável.
- Pode ser traduzido para qualquer idioma instantaneamente.

## 2. Personagem Visual vs. Marca de Influenciador
**Explicação:** Muitos cometem o erro de criar apenas um rosto bonito. A imagem é o "corpo", mas a marca é a "alma".
- **Personagem:** Estética, traços físicos, vestuário.
- **Marca:** Valores, tom de voz, nicho de atuação, história (storytelling).
**Aplicação Prática:** Definir o "porquê" do seu influenciador existir antes de abrir o Midjourney.

## 3. TikTok Shop e a Criação de Conteúdo
O TikTok Shop mudou o jogo ao integrar o checkout diretamente na experiência de consumo de vídeo. Para vender, seu influenciador de IA precisa unir:
- **Branding:** Identidade visual e verbal única.
- **Conteúdo:** Valor real para o seguidor.
- **Storytelling:** Narrativas que conectam o produto à dor do público.
- **Conversão:** Call-to-actions estratégicos e naturais.

## 4. O Método Influencer IA Commerce
Nossa operação é organizada em três pilares:
1. **Gênese:** Criação do avatar e identidade verbal.
2. **Produção:** Fluxo de vídeos hiper-realistas com IA.
3. **Escala:** Gestão de campanhas e otimização de vendas no TikTok Shop.

## 5. Ética e Transparência
Ao atuar com IA em conteúdos comerciais, a transparência é sua maior aliada. Sempre sinalize o uso de IA. Isso gera confiança e protege sua marca contra futuras regulações.

---

# Biblioteca Inicial de Prompts Cirúrgicos

## 1. Definição de Posicionamento e Nicho
**Papel da IA:** Especialista em Estratégia de Marketing Digital e Análise de Tendências.
**Contexto:** Estou criando um influenciador virtual para o TikTok Shop.
**Objetivo:** Definir um nicho lucrativo e um posicionamento único.
**Prompt:** "Analise as tendências atuais do TikTok Shop no Brasil para 2026. Identifique 3 nichos onde há alta demanda mas baixa saturação de influenciadores virtuais. Para cada nicho, sugira um posicionamento estratégico que capitalize sobre a natureza tecnologicamente avançada da IA."

## 2. Criação da Personalidade do Personagem
**Prompt:** "Baseado no nicho [FORNECER NICHO], crie um perfil psicológico detalhado para um influenciador de IA. Inclua: Traços de personalidade (Big Five), arquétipo dominante, valores fundamentais, medos, aspirações e a ''voz'' da marca (formal, zombeteira, técnica, empática)."

## 3. Análise de Produto e Ângulos de Venda
**Prompt:** "Analise este produto: [DESCRIÇÃO DO PRODUTO]. Identifique as 3 principais dores do público que ele resolve. Crie 3 ângulos de abordagem diferentes para um roteiro de vídeo curto (um emocional, um lógico e um baseado em prova social)."

---

# Exercício de Preparação (Projeto Inicial)

**Objetivo:** Definir as bases do seu influenciador.
Preencha o modelo abaixo:
- **Nicho Inicial:** _________________
- **Público-alvo:** _________________
- **Tipo de Influenciador:** (Especialista, Lifestyle, Educador, etc.)
- **Tom de Voz:** _________________
- **Promessa de Comunicação:** _________________
- **Referências Visuais:** _________________',
        -- MATERIAIS COMPLEMENTARES (JSON ou Lista formatada)
        '### Materiais Complementares do Módulo 0
1. **Checklist de Prontidão:** Certifique-se de que possui as ferramentas básicas configuradas.
2. **Ficha Estratégica:** Template para definir a identidade do seu influenciador.
3. **Glossário Técnico:** Termos essenciais (Deepfake, LoRA, Seed, RVC).
4. **Matriz de Posicionamento:** Framework para diferenciar seu personagem da concorrência.'
    ) RETURNING id INTO v_module_id;

    -- Aqui poderíamos inserir questões de quiz se fosse necessário, mas o Módulo 0 é introdutório.
END $$;

COMMIT;
