-- Find course and module IDs
DO $$
DECLARE
    v_course_id UUID;
    v_module_id UUID;
BEGIN
    SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop' LIMIT 1;
    SELECT id INTO v_module_id FROM public.modules WHERE course_id = v_course_id AND sort_order = 3 LIMIT 1;

    IF v_module_id IS NOT NULL THEN
        -- Update Module content and properties
        UPDATE public.modules 
        SET content_text = '# Revisão Mandatória: Módulo 3 - Criação da Identidade do Influenciador Virtual

## Status: RECONSTRUÍDO (PREMIUM)
- **Nome:** Criação da Identidade do Influenciador Virtual
- **Promessa:** Saia do "boneco de IA" e crie uma persona magnética que as pessoas realmente queiram seguir.
- **Objetivos de Aprendizagem:**
  - Definir o DNA psicológico do influenciador.
  - Escolher traços físicos consistentes que geram confiança.
  - Construir a "Voz da Marca" (Tone of Voice) para legendas e interações.

## Conteúdo Pedagógico Denso
A maioria dos iniciantes comete o erro de focar 100% no visual e 0% na personalidade. Um influenciador de IA sem alma é apenas uma imagem estática que ninguém se importa. No TikTok Shop, a confiança (Trust) é a moeda de troca.

### 1. O DNA do Influenciador (The Soul)
Antes de abrir o gerador de imagens, definimos:
- **Origem:** Onde ele(a) mora? Qual sua história? (Storytelling)
- **Valores:** O que ele(a) defende? (Ex: Sustentabilidade, Luxo Acessível, Pragmatismo).
- **Hobbies:** O que ele faz quando não está "vendendo"? Isso humaniza o perfil.

### 2. A Estética Identitária (The Look)
A consistência visual é o que diferencia um amador de um profissional.
- **Etnia e Idade:** Devem ser fixas e alinhadas ao nicho (Módulo 2).
- **Traços Marcantes:** Uma cicatriz, um estilo de óculos, uma cor de cabelo específica. Algo que o cérebro do seguidor identifique em 0.5 segundos no feed.
- **O Cenário Padrão:** Onde esse influenciador vive? Seu "estúdio" ou "casa" deve ter uma paleta de cores consistente.

### 3. Tone of Voice (The Voice)
Como seu influenciador escreve?
- **Formalidade:** Ele usa gírias? É educado? É sarcástico?
- **Emojis:** Defina um conjunto de 3-5 emojis que ele usa sempre para criar padrão visual nas legendas.

## Aplicação ao TikTok Shop
No TikTok Shop, o influenciador atua como um "Curador de Confiança". Ele não "empurra" produtos; ele "recomenda" soluções que ele (teoricamente) testou. A identidade deve transparecer que ele é um expert naquele nicho específico.

## Atividade Principal: O Batismo da Persona
Crie a Ficha Técnica completa do seu influenciador seguindo o template:
1. Nome Artístico.
2. Idade e Localização.
3. 3 Traços de Personalidade.
4. 1 Grande Diferencial Visual.
5. O "Porquê" ele ajuda as pessoas.

## Biblioteca de Prompts AI-to-AI
**Prompt para GPT/Claude (Definição de Persona):**
> "Atue como um Diretor de Branding. Preciso criar a identidade de um influenciador virtual para o TikTok Shop focado no nicho de [INSERIR NICHO]. Ele deve ser [TRAÇO 1] e [TRAÇO 2]. Gere uma biografia de 3 parágrafos, uma lista de 5 valores inegociáveis e descreva detalhadamente sua aparência física para que eu possa usar como base em geradores de imagem."

## Checklist de Validação
- [ ] A personalidade está alinhada com o público-alvo?
- [ ] O visual é distinto o suficiente para ser lembrado?
- [ ] O "tom de voz" é replicável por qualquer pessoa que gerencie a conta?

## Critérios de Conclusão e Resultado Esperado
- **Critério:** Ficha técnica preenchida e aprovada.
- **Resultado:** Uma identidade sólida que servirá de "âncora" para toda a geração de conteúdo futuro, garantindo que o público não perceba variações bruscas de personalidade ou aparência.', 
            video_url = NULL, 
            content_type = 'text',
            updated_at = NOW()
        WHERE id = v_module_id;

        -- Remove old questions
        DELETE FROM public.questions WHERE module_id = v_module_id;

        -- Insert new questions
        INSERT INTO public.questions (module_id, course_id, question, options, correct_answer, status, difficulty, source_type) VALUES
        (
          v_module_id,
          v_course_id,
          'Qual é o erro mais comum de iniciantes ao criar um influenciador de IA?',
          '[{"id": "0", "text": "Focar demais na personalidade e esquecer o visual."}, {"id": "1", "text": "Focar 100% no visual e 0% na construção da personalidade e alma da persona."}, {"id": "2", "text": "Usar ferramentas gratuitas em vez de pagas."}, {"id": "3", "text": "Postar conteúdo todos os dias no TikTok."}]'::jsonb,
          '1',
          'approved',
          'medium',
          'manual'
        ),
        (
          v_module_id,
          v_course_id,
          'No contexto do TikTok Shop, qual é a principal função da identidade do influenciador?',
          '[{"id": "0", "text": "Apenas parecer bonito nas fotos."}, {"id": "1", "text": "Gerar entretenimento puro sem intenção de venda."}, {"id": "2", "text": "Atuar como um Curador de Confiança, validando produtos para o público."}, {"id": "3", "text": "Esconder que é uma inteligência artificial a qualquer custo."}]'::jsonb,
          '2',
          'approved',
          'medium',
          'manual'
        );
    END IF;
END $$;