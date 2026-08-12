
import { supabase } from "./src/integrations/supabase/client.server.ts";

async function rebuildModule4() {
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'influenciador-ia-tiktok-shop')
    .single();

  if (!course) {
    console.error('Course not found');
    process.exit(1);
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, sort_order')
    .eq('course_id', course.id)
    .order('sort_order');

  const mod4 = modules?.find(m => m.sort_order === 4);
  
  if (!mod4) {
    console.error('Module 4 not found');
    process.exit(1);
  }

  const contentText = `
# Módulo 4: Consistência Visual, Ficha Técnica e Biblioteca de Identidade

## Objetivo do Módulo
Dominar as técnicas de "Seed" e "Reference" para garantir que seu influenciador tenha o mesmo rosto, corpo e aura em todas as postagens, construindo uma marca inconfundível.

## O Problema da "IA Camaleão"
O erro número 1 de quem começa é postar fotos onde o influenciador parece uma pessoa diferente a cada post. Isso destrói a confiança. No TikTok Shop, se o rosto muda 5%, o cérebro do seguidor grita "FAKE" e a venda é perdida.

## A Ficha Técnica (O Guia de Estilo)
Você não deve apenas gerar imagens; você deve seguir um manual. Sua Ficha Técnica deve conter:
- **Seed Master:** O número de semente original (se usar Stable Diffusion/Midjourney).
- **Prompt de Rosto Fixo:** A descrição exata das características faciais (ex: "olhos amendoados cor de mel, nariz levemente arrebitado, pequena sarda na bochecha esquerda").
- **Paleta de Materiais:** As texturas e tecidos que ele(a) costuma usar.

## Técnicas de Consistência Visual
1. **Character Reference (--cref no Midjourney):** Como usar imagens de referência para manter o personagem estável em diferentes cenários.
2. **LoRA Personalizado:** Introdução à criação de modelos treinados com o rosto do seu personagem (para usuários avançados).
3. **Biblioteca de Ambientes:** Definição de 3 cenários fixos (ex: Escritório Clean, Cozinha Moderna, Quarto Aconchegante) para manter a iluminação consistente.

## Biblioteca de Prompts AI-to-AI
**Prompt para Geração de Imagem Consistente:**
> "Character portrait of a [DESCRIÇÃO DO PERSONAGEM], [ETNIA], [IDADE], wearings [VESTIMENTA], in a [CENÁRIO], cinematic lighting, hyper-realistic, 8k, consistent facial features, --cref [URL_DA_IMAGEM_MESTRA] --cw 100"

## Aplicação ao TikTok Shop
A consistência visual permite que você faça "Unboxing" de produtos diferentes em dias diferentes sem que pareça propaganda aleatória. O influenciador se torna o apresentador oficial da sua própria vitrine.

## Exemplo Prático: A IA "Tech-Girl"
- **Visual:** Cabelo curto platinado, óculos de aro fino, sempre em ambientes com luz neon azul/roxo.
- **Consistência:** Ela nunca aparece de cabelo comprido ou em uma fazenda. O cérebro do seguidor associa o "visual neon" com "novidades de tecnologia".

## Atividade Principal: O Manual da Marca
Crie o documento PDF (ou texto) com a "Ficha Técnica" do seu influenciador, contendo:
1. Prompt de Rosto (Físico).
2. Prompt de Estilo (Roupas/Cores).
3. 3 Fotos de Referência (Ângulos Diferentes).

## Checklist de Validação
- [ ] O rosto é reconhecível como a mesma pessoa em 3 cenários diferentes?
- [ ] A iluminação segue o mesmo padrão de temperatura (quente/fria)?
- [ ] As roupas respeitam a paleta de cores da marca?

## Critérios de Conclusão e Resultado Esperado
- **Critério:** Apresentação de 3 imagens geradas com consistência comprovada.
- **Resultado:** O fim da "IA Camaleão". Você agora tem um ativo digital que possui valor de marca e reconhecimento imediato pelo público.
`.trim();

  const { error: updateError } = await supabase
    .from('modules')
    .update({ 
      content_text: contentText,
      video_url: null,
      content_type: 'text',
      description: 'Garantindo o mesmo rosto e aura em todas as postagens para construir confiança no TikTok Shop.'
    })
    .eq('id', mod4.id);

  if (updateError) {
    console.error('Update error:', updateError);
    process.exit(1);
  }

  // Atualizar Perguntas do Quiz
  await supabase.from('questions').delete().eq('module_id', mod4.id);
  
  const { error: qError } = await supabase.from('questions').insert([
    {
      module_id: mod4.id,
      course_id: course.id,
      question_text: 'Qual o principal risco de não manter a consistência visual do influenciador de IA?',
      options: ['Perder seguidores por tédio', 'Destruição da confiança (Trust) e quebra da venda', 'Aumento do custo de processamento da imagem', 'Problemas com direitos autorais'],
      correct_option_index: 1,
      points: 10,
      status: 'approved'
    },
    {
      module_id: mod4.id,
      course_id: course.id,
      question_text: 'O que é a técnica de "Character Reference" (--cref)?',
      options: ['Uma forma de citar outros influenciadores no post', 'Uma técnica para usar imagens de referência e manter o rosto estável', 'Um comando para gerar fundos realistas', 'Uma ferramenta de edição de vídeo'],
      correct_option_index: 1,
      points: 10,
      status: 'approved'
    },
    {
      module_id: mod4.id,
      course_id: course.id,
      question_text: 'Por que ter um "Cenário Padrão" ajuda na consistência?',
      options: ['Porque economiza tempo de renderização', 'Porque mantém a iluminação e a atmosfera visual previsíveis', 'Porque o TikTok exige cenários fixos', 'Porque atrai patrocinadores de decoração'],
      correct_option_index: 1,
      points: 10,
      status: 'approved'
    }
  ]);

  if (qError) {
    console.error('Quiz update error:', qError);
    process.exit(1);
  }

  console.log('Successfully rebuilt Module 4');
}

rebuildModule4();
