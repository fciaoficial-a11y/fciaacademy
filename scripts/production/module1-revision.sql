-- REVISÃO MANDATÓRIA MÓDULO 1: Mentalidade e Nichos Lucrativos
-- Removendo placeholder de vídeo e injetando conteúdo denso premium

UPDATE public.modules
SET 
    content_text = '### 🎯 Promessa do Módulo
Dominar a psicologia do consumo no TikTok Shop e selecionar um nicho de alta conversão para o seu Influenciador de IA, garantindo um posicionamento inabalável desde o dia zero.

---

### 🎓 Objetivos de Aprendizagem
- Compreender a mecânica de venda por impulso do TikTok Shop.
- Identificar nichos de mercado com baixa barreira de entrada para IAs.
- Definir o arquétipo do influenciador com base no nicho escolhido.
- Dominar a análise de concorrência e o "Blue Ocean Strategy" no Social Commerce.

---

### 📚 Introdução Pedagógica
Diferente do Instagram ou YouTube, o TikTok Shop é movido por **desejo imediato**. O usuário não entra para pesquisar; ele entra para ser entretido e acaba comprando. O seu Influenciador de IA não é apenas um rosto bonito; ele é uma máquina de validação social. Para ter sucesso, você precisa alinhar a "vibe" do influenciador com a necessidade latente do seu nicho.

---

### 🧠 Conteúdo Aprofundado: A Psicologia do TikTok Shop
O TikTok Shop opera no modelo de "Entertainment Commerce". O conteúdo deve ser nativo. Se parecer um anúncio, o usuário pula.
1. **O Gatilho da Novidade:** IAs têm vantagem inerente pela estética perfeita.
2. **A Prova Social Automatizada:** Como usar a IA para demonstrar produtos de forma hipnótica.
3. **Fricção Zero:** A integração direta da loja exige que o conteúdo seja direto e persuasivo.

### 🗺️ O Mapa de Nichos Lucrativos (TikTok Shop 2026)
- **Nicho 1: Tech & Setup (Gadgets):** Alta conversão, público engajado, estética futurista combina com IA.
- **Nicho 2: Beauty & Skincare Virtual:** Testes de produtos e rotinas "impossíveis" (estilo ASMR visual).
- **Nicho 3: Life Hacks & Home Organization:** Onde a IA demonstra utilidade prática com edição ágil.
- **Nicho 4: Fashion Trends (Virtual Try-on):** Mostrar como as roupas vestem em diferentes biotipos (simulados).

---

### 🛠️ Explicação Prática: O Teste do Nicho de 3 Camadas
Antes de criar o perfil, passe seu nicho pelo filtro:
1. **Demanda Viral:** Existem vídeos de produtos similares com +100k views?
2. **Disponibilidade de Amostras:** O produto é fácil de encontrar para gerar referências visuais?
3. **Escalabilidade de Conteúdo:** É fácil criar 3 vídeos por dia sem repetir o conceito?

---

### 💡 Exemplos Aplicados ao TikTok Shop
*Exemplo:* Influenciador de IA no nicho de "Home Decor Minimalista".
*Ação:* O vídeo começa com o influenciador reorganizando uma mesa de escritório com produtos da loja em 15 segundos, usando trilha sonora de alta energia.

---

### ✍️ Exercício Prático
Escolha 3 produtos que estão em alta no TikTok Shop hoje. Para cada um, escreva uma frase de efeito (hook) que seu influenciador de IA usaria para prender a atenção em 2 segundos.

---

### 🚀 Atividade Principal: O Plano de Voo do Nicho
Crie um documento (PDF/Doc) definindo:
1. Nome do Nicho.
2. Público-alvo (Idade, Interesses).
3. 3 Principais concorrentes (influenciadores humanos ou IA).
4. O diferencial único do seu influenciador.

---

### 📂 Materiais Complementares
- [PDF] Dicionário de Termos do TikTok Shop.
- [Link] Base de Dados de Produtos Tendência (Q3 2026).
- [Template] Planilha de Análise de Concorrência.

---

### 🤖 Biblioteca de Prompts AI-to-AI (Nicho & Estratégia)
**Prompt para Análise de Nicho:**
> "Atue como um Especialista em Growth para TikTok Shop. Analise o nicho [NOME DO NICHO] e identifique 5 dores emocionais dos compradores que podem ser exploradas por um influenciador virtual de IA. Foque em gatilhos de escassez e desejo imediato."

---

### ✅ Checklist de Validação
- [ ] Nicho definido com clareza.
- [ ] Público-alvo mapeado.
- [ ] 3 produtos âncora selecionados.
- [ ] O influenciador tem um motivo claro para existir nesse nicho.

---

### 🏆 Critérios de Conclusão
O módulo é considerado concluído quando o aluno submeter o "Plano de Voo do Nicho" e obtiver aprovação no quiz de mentalidade.

---

### 🌟 Resultado Esperado
Ter a fundação estratégica pronta, eliminando a dúvida sobre "o que vender" e focando 100% na execução técnica nos próximos módulos.',
    video_url = NULL, -- REMOÇÃO MANDATÓRIA DE VÍDEO
    content_url = NULL,
    is_published = false -- MANTER STANDBY
WHERE course_id IN (SELECT id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop')
  AND slug = 'mentalidade-e-nichos-lucrativos';

-- Limpando questões antigas/placeholders para o Módulo 1
DELETE FROM public.questions 
WHERE module_id IN (
    SELECT id FROM public.modules 
    WHERE course_id IN (SELECT id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop')
      AND slug = 'mentalidade-e-nichos-lucrativos'
);

-- Inserindo Questões Premium Módulo 1
INSERT INTO public.questions (module_id, question_text, options, correct_answer, explanation)
VALUES 
(
    (SELECT id FROM public.modules WHERE course_id IN (SELECT id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop') AND slug = 'mentalidade-e-nichos-lucrativos'),
    'Qual é o principal motor de compras no TikTok Shop, segundo o módulo?',
    '["Pesquisa intencional de preços", "Desejo imediato e entretenimento", "Comparação de especificações técnicas", "Lealdade histórica à marca"]',
    'Desejo imediato e entretenimento',
    'O TikTok Shop é movido por "Entertainment Commerce", onde a venda ocorre pelo impulso gerado pelo conteúdo nativo.'
),
(
    (SELECT id FROM public.modules WHERE course_id IN (SELECT id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop') AND slug = 'mentalidade-e-nichos-lucrativos'),
    'Por que influenciadores de IA têm vantagem no nicho de Gadgets/Tech?',
    '["Porque não precisam de internet", "Porque sua estética futurista e perfeita se alinha com a natureza dos produtos tecnológicos", "Porque o custo de frete é menor", "Porque o TikTok proíbe humanos nesse nicho"]',
    'Porque sua estética futurista e perfeita se alinha com a natureza dos produtos tecnológicos',
    'A estética da IA comunica inovação e perfeição, o que gera confiança subconsciente em produtos de tecnologia.'
);
