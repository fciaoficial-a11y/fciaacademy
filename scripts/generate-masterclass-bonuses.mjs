/**
 * Gerador dos 4 PDFs de bônus do Masterclass "Método IA Criativa".
 *
 * Uso local (não entra no bundle):
 *   node scripts/generate-masterclass-bonuses.mjs
 *
 * Saída: /tmp/bonuses/{01..04}-*.pdf
 * Depois: `lovable-assets create --file <pdf>` e semear course_bonuses.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

// ================================================================
// IDENTIDADE FCIA (dark premium)
// ================================================================
const COLORS = {
  bg:        rgb(0.039, 0.059, 0.102), // #0A0F1A
  surface:   rgb(0.067, 0.094, 0.153), // #111827
  border:    rgb(0.18,  0.22,  0.32),  // linha sutil
  text:      rgb(0.961, 0.969, 0.98),  // #F5F7FA
  muted:     rgb(0.58,  0.64,  0.72),  // #94A3B8
  accent:    rgb(0.133, 0.827, 0.933), // cyan #22D3EE
  gold:      rgb(0.918, 0.706, 0.031), // #EAB308
};

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ================================================================
// HELPERS DE RENDER
// ================================================================
function wrapText(text, font, size, maxWidth) {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawBg(page) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.bg });
}

function drawFooter(page, fonts, meta) {
  const { helv } = fonts;
  page.drawRectangle({
    x: MARGIN, y: 40, width: CONTENT_W, height: 0.6, color: COLORS.border,
  });
  page.drawText("FCIA Academy - Método IA Criativa", {
    x: MARGIN, y: 26, size: 8, font: helv, color: COLORS.muted,
  });
  const right = `${meta.bonusLabel} - pág. ${meta.page}`;
  const w = helv.widthOfTextAtSize(right, 8);
  page.drawText(right, { x: PAGE_W - MARGIN - w, y: 26, size: 8, font: helv, color: COLORS.muted });
}

function drawSectionHeader(page, fonts, title, eyebrow, y) {
  const { helvBold, helv } = fonts;
  if (eyebrow) {
    page.drawText(eyebrow.toUpperCase(), {
      x: MARGIN, y, size: 8, font: helvBold, color: COLORS.accent,
      characterSpacing: 2,
    });
    y -= 18;
  }
  const titleLines = wrapText(title, helvBold, 20, CONTENT_W);
  for (const l of titleLines) {
    page.drawText(l, { x: MARGIN, y, size: 20, font: helvBold, color: COLORS.text });
    y -= 26;
  }
  // linha accent curta
  page.drawRectangle({ x: MARGIN, y: y + 6, width: 42, height: 2, color: COLORS.accent });
  return y - 20;
}

// ================================================================
// GERADOR
// ================================================================
class DocBuilder {
  constructor(pdf, fonts, bonusLabel) {
    this.pdf = pdf;
    this.fonts = fonts;
    this.bonusLabel = bonusLabel;
    this.pageNum = 0;
    this.page = null;
    this.y = 0;
  }

  newPage() {
    this.pageNum += 1;
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    drawBg(this.page);
    drawFooter(this.page, this.fonts, { bonusLabel: this.bonusLabel, page: this.pageNum });
    this.y = PAGE_H - MARGIN;
  }

  ensureSpace(needed) {
    if (this.y - needed < 80) this.newPage();
  }

  h1(text) {
    // h1 sempre inicia nova página (capítulo novo)
    if (this.pageNum === 0 || this.y < PAGE_H - MARGIN - 4) this.newPage();
    this.y -= 40; // respiro superior de capítulo
    this.y = drawSectionHeader(this.page, this.fonts, text, null, this.y);
    this.y -= 8;
  }

  h2(text, eyebrow) {
    this.ensureSpace(120);
    this.y -= 10;
    this.y = drawSectionHeader(this.page, this.fonts, text, eyebrow, this.y);
  }

  p(text, opts = {}) {
    const { helv } = this.fonts;
    const size = opts.size ?? 11;
    const color = opts.color ?? COLORS.text;
    const lines = wrapText(text, helv, size, CONTENT_W);
    for (const l of lines) {
      this.ensureSpace(size + 6);
      this.page.drawText(l, { x: MARGIN, y: this.y, size, font: helv, color });
      this.y -= size + 6;
    }
    this.y -= 10;
  }

  muted(text) {
    this.p(text, { color: COLORS.muted, size: 10 });
  }

  bullet(text) {
    const { helv, helvBold } = this.fonts;
    const size = 10.5;
    const bulletX = MARGIN + 4;
    const textX = MARGIN + 18;
    const w = CONTENT_W - 18;
    const lines = wrapText(text, helv, size, w);
    this.ensureSpace(lines.length * (size + 4) + 4);
    this.page.drawText("›", { x: bulletX, y: this.y, size: size + 1, font: helvBold, color: COLORS.accent });
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) this.ensureSpace(size + 4);
      this.page.drawText(lines[i], { x: textX, y: this.y, size, font: helv, color: COLORS.text });
      this.y -= size + 4;
    }
    this.y -= 2;
  }

  card(title, body) {
    const { helv, helvBold } = this.fonts;
    const padY = 14;
    const padX = 16;
    const titleSize = 11.5;
    const bodySize = 10;
    const bodyLines = wrapText(body, helv, bodySize, CONTENT_W - padX * 2);
    const titleLines = wrapText(title, helvBold, titleSize, CONTENT_W - padX * 2);
    const h = padY * 2 + titleLines.length * (titleSize + 3) + 6 + bodyLines.length * (bodySize + 3);
    this.ensureSpace(h + 8);
    const top = this.y;
    this.page.drawRectangle({
      x: MARGIN, y: top - h, width: CONTENT_W, height: h,
      color: COLORS.surface, borderColor: COLORS.border, borderWidth: 0.6,
    });
    let ly = top - padY - titleSize;
    for (const l of titleLines) {
      this.page.drawText(l, { x: MARGIN + padX, y: ly, size: titleSize, font: helvBold, color: COLORS.text });
      ly -= titleSize + 3;
    }
    ly -= 4;
    for (const l of bodyLines) {
      this.page.drawText(l, { x: MARGIN + padX, y: ly, size: bodySize, font: helv, color: COLORS.muted });
      ly -= bodySize + 3;
    }
    this.y = top - h - 10;
  }

  prompt(label, template) {
    const { helv, helvBold, mono } = this.fonts;
    const labelSize = 10;
    const bodySize = 9.5;
    const padY = 12;
    const padX = 14;
    const bodyLines = wrapText(template, mono, bodySize, CONTENT_W - padX * 2);
    const h = padY * 2 + labelSize + 6 + bodyLines.length * (bodySize + 3);
    this.ensureSpace(h + 8);
    const top = this.y;
    this.page.drawRectangle({
      x: MARGIN, y: top - h, width: CONTENT_W, height: h,
      color: COLORS.surface, borderColor: COLORS.accent, borderWidth: 0.6,
    });
    this.page.drawText(label.toUpperCase(), {
      x: MARGIN + padX, y: top - padY - labelSize + 2, size: labelSize - 1,
      font: helvBold, color: COLORS.accent, characterSpacing: 1.5,
    });
    let ly = top - padY - labelSize - 6 - bodySize;
    for (const l of bodyLines) {
      this.page.drawText(l, { x: MARGIN + padX, y: ly, size: bodySize, font: mono, color: COLORS.text });
      ly -= bodySize + 3;
    }
    this.y = top - h - 10;
  }

  cover({ eyebrow, title, subtitle }) {
    this.newPage();
    // faixa accent
    this.page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: COLORS.accent });

    const { helv, helvBold } = this.fonts;
    let y = PAGE_H - 200;
    this.page.drawText("FCIA ACADEMY", {
      x: MARGIN, y, size: 10, font: helvBold, color: COLORS.accent, characterSpacing: 4,
    });
    y -= 36;
    this.page.drawText(eyebrow.toUpperCase(), {
      x: MARGIN, y, size: 11, font: helvBold, color: COLORS.gold, characterSpacing: 2,
    });
    y -= 42;
    const titleLines = wrapText(title, helvBold, 32, CONTENT_W);
    for (const l of titleLines) {
      this.page.drawText(l, { x: MARGIN, y, size: 32, font: helvBold, color: COLORS.text });
      y -= 40;
    }
    y -= 16;
    const subLines = wrapText(subtitle, helv, 13, CONTENT_W - 20);
    for (const l of subLines) {
      this.page.drawText(l, { x: MARGIN, y, size: 13, font: helv, color: COLORS.muted });
      y -= 18;
    }

    // rodapé cover
    this.page.drawRectangle({ x: MARGIN, y: 120, width: CONTENT_W, height: 0.6, color: COLORS.border });
    this.page.drawText("Bônus exclusivo - Masterclass Método IA Criativa", {
      x: MARGIN, y: 100, size: 9, font: helvBold, color: COLORS.text, characterSpacing: 1,
    });
    this.page.drawText("Uso pessoal. Distribuição proibida.", {
      x: MARGIN, y: 84, size: 8.5, font: helv, color: COLORS.muted,
    });
  }
}

// ================================================================
// CONTEÚDO — 4 BÔNUS
// ================================================================
async function buildBonus01() {
  const pdf = await PDFDocument.create();
  const fonts = { helv: await pdf.embedFont(StandardFonts.Helvetica), helvBold: await pdf.embedFont(StandardFonts.HelveticaBold), mono: await pdf.embedFont(StandardFonts.Courier) };
  const b = new DocBuilder(pdf, fonts, "Bônus 01");
  b.cover({
    eyebrow: "Bônus 01",
    title: "Biblioteca de Prompts Mestres",
    subtitle: "Ponto de partida testado para imagem, vídeo, áudio e roteiro — no padrão da FCIA.",
  });

  b.newPage();
  b.h1("Como usar esta biblioteca");
  b.p("Cada prompt aqui foi calibrado em produção real. A estrutura é fixa: contexto -> instrução -> refinamento. Copie, ajuste apenas o [BRACKET] e refine em ciclos curtos. Não substitua a estrutura pela sua opinião inicial — só depois de duas iterações.");
  b.p("Ordem recomendada de leitura: comece pela seção da mídia que você mais entrega hoje. As demais servem como ampliação depois que a primeira estiver dominada.");
  b.muted("Convenção: [BRACKET] = variável obrigatória. {opcional} = variável que refina. // comentário = orientação de uso.");

  b.h2("Imagem", "Seção 1 - 12 prompts");
  const imgPrompts = [
    ["Retrato editorial", "Retrato editorial em plano médio de [pessoa/arquétipo], iluminação lateral suave estilo Rembrandt, película 35mm, grão sutil, paleta [dourado quente | azul frio | terroso]. Textura de pele preservada, foco nítido nos olhos, fundo desfocado com profundidade ~f/2.0. // refine trocando lente ou paleta antes de mudar tudo."],
    ["Still de produto", "Still de produto fotográfico ultra-realista de [produto], superfície de [mármore | madeira crua | linho], luz principal 45° superior, luz de preenchimento fria, reflexo controlado. Composição centralizada, respiro superior, sombra suave. Renderização em alta fidelidade, sem branding fictício."],
    ["Cena de marca", "Cena de marca em ambiente [descrever ambiente e época], figurantes em ação natural, paleta consistente [3 cores], atmosfera [calma | vibrante | ritualística]. Câmera na altura dos olhos, lente 35mm, luz motivada por [fonte real]. Sem elementos gráficos, sem texto."],
    ["Paisagem cinemática", "Paisagem cinemática de [local], hora [nascer do sol | golden hour | blue hour], atmosfera [descrever clima], em plano wide, proporção 2.39:1, contraste editorial. Referência: [Deakins | Chivo | Fraser]. Sem pós-produção artificial evidente."],
    ["Ilustração autoral", "Ilustração autoral de [tema], estilo [descrever traço], paleta reduzida a 4 cores, textura de papel de fundo, composição assimétrica com respiro à direita, sem sombra dura. Não usar look genérico de IA."],
    ["Capa editorial", "Capa editorial estilo revista [ex.: Kinfolk | Wired | Wallpaper], hero visual de [tema], espaço superior reservado para logotipo, retícula visível, tipografia serifada apenas como sugestão de área, sem texto real."],
    ["Interface fictícia", "Mock de interface digital para [tipo de produto], estética dark premium com acento [cor], grid limpo, ícones minimalistas, componentes com sombras suaves. Sem lorem ipsum. Apenas rótulos plausíveis em [PT-BR]."],
    ["Foto documental", "Foto documental honesta de [contexto], sem pose, luz disponível, grão natural, câmera na cintura. Registro [preto e branco | cor dessaturada]. Referência: [Cartier-Bresson | Salgado]. Nada teatral."],
    ["Textura editorial", "Textura de fundo editorial em [material — papel canvas, concreto polido, tecido], luz rasante para revelar relevo, sem repetição óbvia, adequada para overlay tipográfico."],
    ["Retrato conceitual", "Retrato conceitual de [pessoa/arquétipo] com [objeto simbólico], iluminação teatral, fundo escuro, foco em [detalhe]. Composição estática, atmosfera [descrever emoção]. Sem gestos exagerados."],
    ["Cena de trabalho", "Cena de trabalho real em [ambiente profissional], plano ampliado mostrando mãos em ação e ferramentas. Luz natural entrando de [direção]. Verossimilhança acima de estética."],
    ["Cover de curso", "Cover de curso digital com hero visual de [tema], espaço à esquerda para wordmark, atmosfera confiante e séria, paleta [3 tons]. Sem stock photo, sem elementos genéricos de IA."],
  ];
  for (const [t, p] of imgPrompts) b.prompt(t, p);

  b.h2("Vídeo (roteiro de shot)", "Seção 2 - 10 prompts");
  const vidPrompts = [
    ["Abertura de manifesto", "Abertura de vídeo manifesto: plano wide de [ambiente/símbolo], movimento suave de dolly-in por 4s, som ambiente cheio. Voz-off entra em [segundo 3] com uma frase-tese curta sobre [tema]. Corte seco para plano fechado do rosto do apresentador."],
    ["Tutorial de produto", "Tutorial de [produto/ferramenta]: plano cabeça-e-ombros do apresentador (2s) -> tela cheia da interface com highlight na ação (5s) -> volta ao apresentador para conclusão (3s). Legenda queimada. Sem música até o final."],
    ["Testemunho autêntico", "Testemunho em 30s: rosto do cliente, luz natural, fundo desfocado. Estrutura: 'Antes eu... / Comecei a usar... / Hoje eu...'. Corte apenas nas respirações. Sem trilha durante a fala."],
    ["Storytelling curto", "Vídeo de 45s em 3 atos: [conflito] em 15s, [virada] em 15s, [resolução] em 15s. Cada ato começa com um plano wide e fecha em close. Trilha entra no ato 3."],
    ["Bastidor editorial", "Bastidor de produção: câmera na mão, movimento discreto, sem estabilização perfeita. Foco em detalhes: mãos, olhares, ferramentas. Sem música — som ambiente e vozes reais."],
    ["Reel autoral", "Reel de 20s em plano vertical: 4 planos rápidos (5s cada) mostrando processo de [criação], transições por corte seco no batidão da trilha. Última frame com respiro para wordmark."],
    ["Anúncio direto", "Anúncio de 15s: gancho visual nos primeiros 2s, oferta clara em texto queimado do 3º ao 12º, CTA visual do 12º ao 15º. Sem intro, sem loja de vinheta."],
    ["Aula em bloco", "Aula em bloco único de 6 min: apresentador em plano fixo, câmera 50mm, uma quebra visual a cada 90s (b-roll relacionado). Corte apenas para remover ums e ãs."],
    ["Vinheta institucional", "Vinheta institucional de 8s: 3 planos abstratos (materiais, texturas, movimento), fusão suave, cor grading unificado. Wordmark aparece apenas no último frame."],
    ["Depoimento em movimento", "Cliente caminhando enquanto fala, câmera acompanha lateralmente. Plano médio. Fala natural, sem roteiro decorado. Máximo 40s."],
  ];
  for (const [t, p] of vidPrompts) b.prompt(t, p);

  b.h2("Áudio / voz / trilha", "Seção 3 - 8 prompts");
  const audPrompts = [
    ["Voz-off institucional", "Voz-off masculina/feminina brasileira, timbre grave-médio, ritmo pausado, intenção confiante-serena. Sem entoação comercial. Texto: [inserir]. Tempo alvo: 20s."],
    ["Trilha ambiente", "Trilha ambiente instrumental, andamento 70 BPM, textura de piano feltrado + strings sustentadas, sem percussão marcada. Duração 60s, loop no minuto."],
    ["Podcast em dupla", "Diálogo de podcast em dupla, tom informal-culto, blocos de 45s por rodada, sem interrupções. Assunto: [tema]. Cada bloco começa com uma pergunta provocativa."],
    ["Meditação guiada curta", "Voz feminina calma, respiração audível entre frases, pausas de 3s. Estrutura: chegada (30s) -> foco (60s) -> intenção (30s). Sem música."],
    ["Anúncio de rádio 30s", "Anúncio de rádio 30s: gancho auditivo nos primeiros 3s (som/palavra), corpo com benefício central 12s, prova social 10s, CTA final 5s. Sem música dominante."],
    ["Trilha para reel", "Trilha instrumental 20s, batidão em 4/4, camadas eletrônicas suaves, subida no segundo 15, drop leve no 18. Sem vocais."],
    ["Voz de personagem", "Voz de personagem [descrever arquétipo: mentor sábio, jovem curioso, narrador irônico], sotaque neutro brasileiro, marcação clara de pontuação, sem exagero teatral."],
    ["Ambientação sonora", "Paisagem sonora de [ambiente], 45s em loop imperceptível, camadas: base contínua, textura média com variação, elementos pontuais raros. Sem música."],
  ];
  for (const [t, p] of audPrompts) b.prompt(t, p);

  b.h2("Roteiro / texto longo", "Seção 4 - 10 prompts");
  const txtPrompts = [
    ["Roteiro de manifesto", "Escreva um manifesto de 400 palavras sobre [tema]. Estrutura: verdade incômoda / o que muda / convite. Tom firme, sem jargão. Frases curtas. Nenhuma metáfora batida."],
    ["Copy de venda direta", "Copy de venda para [oferta] em 6 blocos: gancho, dor, virada, prova, oferta, CTA. Máximo 700 palavras totais. Sem 'garantia', 'aproveite', 'imperdível'."],
    ["Roteiro de aula", "Roteiro de aula de 15 min sobre [tópico]. Blocos: promessa (1min), mapa (1min), 3 conceitos (3min cada), aplicação (2min), fechamento (2min). Cada conceito termina com pergunta ao aluno."],
    ["Newsletter semanal", "Newsletter de 500 palavras sobre [tema], estrutura 'uma ideia, um exemplo, uma pergunta'. Voz pessoal, primeira pessoa. Assunto que não pareça vendedor."],
    ["Descrição de produto", "Descrição comercial de [produto] em 3 níveis: 20 palavras (frase-hero), 80 palavras (pitch), 250 palavras (página). Nenhuma repetir a outra."],
    ["Case de estudo", "Case de cliente em 4 seções: contexto, problema real, o que fizemos, resultado (com número). 600 palavras. Sem elogio ao próprio serviço."],
    ["Roteiro de webinar", "Roteiro de webinar de 45 min: 5 min abertura, 30 min conteúdo em 3 pilares, 5 min oferta, 5 min Q&A. Cada pilar com transição narrativa clara."],
    ["Bio profissional", "Bio profissional em 3 versões: 1 linha (perfil), 50 palavras (site), 150 palavras (assessoria). Sem clichê ('apaixonado por')."],
    ["Post carrossel", "Roteiro de carrossel de 8 slides sobre [tema]: slide 1 gancho, slides 2-7 conteúdo em uma ideia por slide, slide 8 CTA. Nenhuma frase com mais de 12 palavras."],
    ["Pitch de 60s", "Pitch verbal de 60s para [oferta], estrutura: quem eu ajudo / a que resultado / como faço diferente / prova / próximo passo. Sem jargão de mercado."],
  ];
  for (const [t, p] of txtPrompts) b.prompt(t, p);

  b.h1("Refinar em ciclos");
  b.p("Todo prompt aqui é v1. Rode, avalie o resultado em 3 critérios objetivos e refine 2 vezes antes de trocar de prompt. Trocar cedo é o principal erro de quem inicia.");
  b.bullet("Critério 1: a peça comunica a intenção declarada?");
  b.bullet("Critério 2: cara de IA genérica evitada?");
  b.bullet("Critério 3: coerência com o resto da marca?");
  b.p("Se dois dos três estão bem, refine apenas o terceiro. Se nenhum está, o problema não é o prompt — é o briefing.");

  return pdf.save();
}

async function buildBonus02() {
  const pdf = await PDFDocument.create();
  const fonts = { helv: await pdf.embedFont(StandardFonts.Helvetica), helvBold: await pdf.embedFont(StandardFonts.HelveticaBold), mono: await pdf.embedFont(StandardFonts.Courier) };
  const b = new DocBuilder(pdf, fonts, "Bônus 02");
  b.cover({
    eyebrow: "Bônus 02",
    title: "Painel de Referências Visuais",
    subtitle: "Direção estética pronta para peças com padrão — sem garimpar referência solta.",
  });

  b.newPage();
  b.h1("Como usar este painel");
  b.p("Cada estilo abaixo é uma direção visual completa: intenção, paleta, iluminação, referências e prompt-base. Escolha um estilo por projeto — misturar dois no mesmo entregável dilui a marca. Volte aqui antes de cada peça, não durante.");

  const styles = [
    {
      name: "Editorial silencioso",
      intent: "Peças que precisam de autoridade calma. Menos é mais. Marca fala baixo.",
      palette: "Off-white #F5F3EE - Grafite #2D2D2D - Toque de terracota #C4654A",
      light: "Luz natural lateral suave, sombras longas mas sem drama. Meio-dia nublado.",
      refs: "Kinfolk, Cereal, Apartamento, Aesop, Muji.",
      base: "Composição centralizada com respiro superior generoso. Um único elemento por peça. Tipografia serifada quando houver. Sem gradiente. Sem overlay.",
    },
    {
      name: "Dark premium",
      intent: "Marca de alto valor, tech-forward. Comunica exclusividade sem alarde.",
      palette: "Preto profundo #0A0F1A - Grafite azulado #1E293B - Acento cyan #22D3EE",
      light: "Iluminação teatral, contraste alto, halos suaves. Predominância de sombra.",
      refs: "Rolls-Royce, Bang & Olufsen, Rimowa preto, Linear, Vercel.",
      base: "Composição assimétrica com respiro à direita. Luz motivada em 45°. Detalhe metálico sutil. Sem branco puro em massa.",
    },
    {
      name: "Cinemático 2.39:1",
      intent: "Storytelling visual. Peças que precisam parecer um frame de filme.",
      palette: "Teal #0F3D3E - Âmbar #E8A87C - Preto de cinema #0A0A0A",
      light: "Chave dura + preenchimento frio. Um único ponto de luz visível na cena.",
      refs: "Roger Deakins (1917, Blade Runner 2049), Chivo (Roma), Fraser (Dune).",
      base: "Proporção larga. Personagem descentralizado. Atmosfera densa (bruma, poeira, chuva sutil). Sem sorriso posado.",
    },
    {
      name: "Documental honesto",
      intent: "Prova social real. Cliente, bastidor, testemunho. Zero teatro.",
      palette: "Neutros quentes, tons de pele preservados, verde oliva #556B2F como acento.",
      light: "Luz disponível apenas. Nunca refletor. Grão natural aceito.",
      refs: "Cartier-Bresson, Sebastião Salgado, revista Piauí.",
      base: "Câmera na cintura. Sem posar. Corte no gesto, não na expressão. B&W ou cor dessaturada.",
    },
    {
      name: "Brutalista digital",
      intent: "Marca que quer parar o scroll. Comunica atitude e agora.",
      palette: "Branco puro #FFFFFF - Preto #000000 - Um único acento saturado (laranja #FF5722 ou lime #B3FF00).",
      light: "Sem sutileza. Flash direto, sombra dura. Ou luz de estúdio full-flat.",
      refs: "Balenciaga últimas coleções, Off-White, Vetements.",
      base: "Tipografia gigante ocupando 60% da tela. Elemento fotográfico secundário. Corte agressivo.",
    },
    {
      name: "Natural quente",
      intent: "Marcas de lifestyle, gastronomia, bem-estar. Vibe convidativa.",
      palette: "Areia #FAF8F5 - Terracota #C4654A - Sálvia #87A878.",
      light: "Golden hour. Luz sempre motivada por janela ou sol baixo.",
      refs: "Slow living editorial, Le Creuset, La Marzocco.",
      base: "Elementos orgânicos (linho, cerâmica, madeira crua). Mãos frequentemente presentes. Composição em regra dos terços.",
    },
    {
      name: "Vaporwave sofisticado",
      intent: "Marca criativa jovem, música, cultura digital. Nostalgia calibrada.",
      palette: "Lavanda #C4B5FD - Cyan pálido #A5F3FC - Rosa quente #F472B6.",
      light: "Gradiente neon, halo cromático, névoa colorida.",
      refs: "The Weeknd After Hours, Frank Ocean Blonde, capas Ninja Tune.",
      base: "Fotografia analógica + tratamento digital sutil. Grão + halo. Elementos flutuantes. Simetria.",
    },
    {
      name: "Institucional confiável",
      intent: "Finanças, direito, saúde. Marca que precisa comunicar solidez.",
      palette: "Navy #0F1B3D - Bege quente #E8DDD0 - Ouro sóbrio #C9A84C.",
      light: "Luz de estúdio limpa, sombras curtas, sem drama.",
      refs: "The Economist, McKinsey, Rolex, Patek Philippe editorial.",
      base: "Fotografia formal. Composição simétrica. Tipografia serifada clássica. Nenhum elemento gráfico moderno.",
    },
  ];

  for (const s of styles) {
    b.h2(s.name, "Direção visual");
    b.card("Intenção", s.intent);
    b.card("Paleta", s.palette);
    b.card("Iluminação", s.light);
    b.card("Referências", s.refs);
    b.card("Prompt-base", s.base);
  }

  b.h1("Mood board sem imagem");
  b.p("O mood board de verdade é verbal. Antes de gerar qualquer peça, escreva em 40 palavras: intenção, paleta, luz, referência. Se você não consegue escrever, ainda não sabe o que quer — e a IA vai entregar genérico.");
  return pdf.save();
}

async function buildBonus03() {
  const pdf = await PDFDocument.create();
  const fonts = { helv: await pdf.embedFont(StandardFonts.Helvetica), helvBold: await pdf.embedFont(StandardFonts.HelveticaBold), mono: await pdf.embedFont(StandardFonts.Courier) };
  const b = new DocBuilder(pdf, fonts, "Bônus 03");
  b.cover({
    eyebrow: "Bônus 03",
    title: "Guia de Integração das 4 Mídias",
    subtitle: "Fluxo passo a passo para peças coerentes ponta a ponta: imagem, vídeo, áudio, roteiro.",
  });

  b.newPage();
  b.h1("Por que integrar");
  b.p("A maioria trava porque produz cada mídia em uma janela separada, sem uma direção comum. O resultado parece IA porque é: quatro peças diferentes, sem conversa entre si. A integração começa antes da primeira geração — no briefing.");

  b.h1("Passo 1 - Briefing-mãe");
  b.p("Antes de abrir qualquer ferramenta, escreva o briefing-mãe. Um único documento de meia página que responde:");
  b.bullet("Qual a intenção emocional? (uma palavra: calma, urgência, prestígio, revolta, ternura, precisão)");
  b.bullet("Quem é o receptor? (uma persona específica, não um segmento)");
  b.bullet("Qual a paleta? (3 cores, códigos HEX)");
  b.bullet("Qual a referência estética? (uma direção do painel visual — só uma)");
  b.bullet("Qual o entregável final? (formato, canal, duração, aspecto)");
  b.p("Este documento fica aberto ao lado de toda a produção. Todas as 4 mídias precisam responder às mesmas 5 perguntas.");

  b.h1("Passo 2 - Roteiro primeiro");
  b.p("O roteiro é a espinha. Escreva antes de qualquer imagem ou som. Um roteiro sem visual ainda comunica; uma imagem sem roteiro é decoração.");
  b.bullet("Defina a frase-tese (o que sobra se cortar 90%)");
  b.bullet("Escreva o corpo em blocos temporais (segundos ou parágrafos)");
  b.bullet("Marque os pontos que serão substituídos por imagem/vídeo/áudio");
  b.muted("Regra dura: se um trecho pode ser removido sem prejuízo, ele deve ser removido.");

  b.h1("Passo 3 - Imagem como âncora");
  b.p("A partir do roteiro, decida uma imagem-âncora — aquela que carrega a peça mesmo silenciada. Gere-a antes das outras. Ela dita luz, cor e composição para tudo.");
  b.bullet("Use o prompt-base do estilo escolhido (Bônus 02)");
  b.bullet("Refine em 2 ciclos antes de sair dela");
  b.bullet("Salve a versão final como 'reference master' — todos os prompts seguintes referenciam esta");

  b.h1("Passo 4 - Vídeo em torno da imagem");
  b.p("O vídeo é uma expansão temporal da imagem-âncora. Não gere planos aleatórios — cada plano precisa herdar paleta, luz e enquadramento da âncora.");
  b.bullet("Comece por um plano wide que contextualiza a âncora");
  b.bullet("Feche em close no elemento que a âncora enfatiza");
  b.bullet("Corte apenas onde o roteiro determinar — nunca por reflexo estético");

  b.h1("Passo 5 - Áudio como cimento");
  b.p("O áudio existe para colar as peças, não para brilhar. Trilha e voz sustentam a intenção emocional definida no briefing-mãe.");
  b.bullet("Trilha: andamento coerente com o ritmo do vídeo (BPM dobra ou divide o ritmo do corte)");
  b.bullet("Voz: timbre e ritmo casam com o tom do roteiro escrito");
  b.bullet("Silêncio é uma escolha ativa — se não sabe onde entra, deixa silêncio");

  b.h1("Passo 6 - Retorno ao roteiro");
  b.p("Com imagem, vídeo e áudio prontos, releia o roteiro escrito. Ele ainda faz sentido? Palavras que a imagem já diz podem sair. Peça finalizada é peça onde nenhum elemento repete o que outro já entrega.");

  b.h1("Checklist de coerência");
  b.bullet("As 4 mídias respondem à mesma intenção emocional?");
  b.bullet("A paleta se mantém em imagem, vídeo, capa e slides do roteiro?");
  b.bullet("O ritmo do áudio bate com o ritmo do corte visual?");
  b.bullet("Se eu remover uma mídia, as outras 3 ainda comunicam?");
  b.bullet("A peça se distingue de conteúdo genérico de IA à primeira olhada?");
  b.p("Menos de 4 respostas 'sim' = volte um passo. Não avance para publicar.");

  b.h1("Erros mais comuns");
  b.card("Começar pela imagem sem roteiro", "Gera imagens bonitas que não sustentam nada. A imagem sem tese não sobrevive à segunda visualização.");
  b.card("Gerar tudo em paralelo", "Cada mídia caminha sozinha, resultado sai fragmentado. Sempre em cascata: roteiro -> imagem -> vídeo -> áudio.");
  b.card("Trocar de referência no meio", "Diluir estilo é pior que escolher o estilo errado. Termine com a direção inicial, avalie ao final, refaça se preciso.");
  b.card("Publicar cansado", "A última revisão exige olho descansado. Prefira publicar 24h depois com peça coerente do que agora com peça fragmentada.");

  return pdf.save();
}

async function buildBonus04() {
  const pdf = await PDFDocument.create();
  const fonts = { helv: await pdf.embedFont(StandardFonts.Helvetica), helvBold: await pdf.embedFont(StandardFonts.HelveticaBold), mono: await pdf.embedFont(StandardFonts.Courier) };
  const b = new DocBuilder(pdf, fonts, "Bônus 04");
  b.cover({
    eyebrow: "Bônus 04",
    title: "Kit de Monetização Criativa",
    subtitle: "Do portfólio ao primeiro cliente pagante — método, precificação, script e contrato.",
  });

  b.newPage();
  b.h1("Do método à receita");
  b.p("Ter método é condição, não garantia. Ganhar por criar com IA exige tratar sua entrega como serviço, não como hobby caro. Este kit organiza a passagem: portfólio -> precificação -> abordagem -> proposta -> fechamento -> entrega.");

  b.h1("Passo 1 - Portfólio mínimo viável");
  b.p("Ninguém contrata sem ver. Portfólio inicial precisa de apenas 3 peças, desde que respondam a estas condições:");
  b.bullet("Cada peça mostra uma das 4 mídias em nível profissional");
  b.bullet("Todas seguem uma mesma direção visual (o painel do Bônus 02)");
  b.bullet("Cada uma vem com uma linha explicando o problema que resolveu (mesmo que fictício)");
  b.muted("Portfólio de 30 peças aleatórias vende menos que portfólio de 3 peças com direção.");

  b.h1("Passo 2 - Modelo de precificação");
  b.p("Cobre por resultado, não por hora. Três níveis simples:");
  b.card("Pacote de peça única", "Uma peça (imagem hero, reel de 20s, roteiro completo, faixa curta). R$ 350–R$ 900 conforme complexidade e uso. Prazo 5 dias. Uma revisão inclusa.");
  b.card("Pacote de campanha", "3 a 5 peças coerentes para lançamento. R$ 1.800–R$ 4.500. Prazo 10 dias. Duas revisões por peça. Inclui briefing estruturado.");
  b.card("Assinatura mensal", "8 a 12 peças/mês para presença contínua. R$ 3.500–R$ 8.000. Renovação mensal. Reunião quinzenal de direção. Escopo trocável entre mídias.");
  b.p("Regra da precificação: o cliente compra economia de tempo e certeza de qualidade. Nunca cobre 'a hora que você levou' — cobre o valor que economiza para ele.");

  b.h1("Passo 3 - Script de abordagem");
  b.p("Cold approach por mensagem direta funciona quando é específico. Modelo em 3 mensagens:");
  b.prompt("Mensagem 1 - Observação específica",
    "Oi [nome], vi [peça/post específico] de [empresa]. [Comentário genuíno sobre uma escolha visual/estrutural — 15 palavras]. Você mesmo produz ou tem um time?");
  b.prompt("Mensagem 2 - Oferta implícita",
    "Perguntei porque trabalho com [descrição de 8 palavras — não use 'sou especialista em IA']. Recentemente [caso curto, 25 palavras, com um número quando possível]. Faz sentido eu te mandar 2 exemplos de como aplicaria isso pra [empresa]?");
  b.prompt("Mensagem 3 - Convite baixo esforço",
    "Bacana. Mando por aqui mesmo em 48h — sem compromisso. Se fizer sentido pra vocês depois, a gente conversa sobre próximos passos. Se não, fica registrado como amostra do trabalho.");
  b.p("Nunca envie proposta sem o cliente ter dado dois sinais de interesse. A pressa afasta.");

  b.h1("Passo 4 - Estrutura de proposta");
  b.p("Proposta escrita cabe em uma página. Estrutura em 5 blocos:");
  b.bullet("Diagnóstico (o que entendi do cliente — 3 frases)");
  b.bullet("Objetivo (o que vamos resolver — 2 frases)");
  b.bullet("Escopo (o que entra e o que NÃO entra — lista de bullets)");
  b.bullet("Investimento (valor, prazo, forma de pagamento)");
  b.bullet("Próximo passo (aceite via mensagem + link/data)");
  b.muted("Escopo com 'o que NÃO entra' fecha 30% mais rápido. Elimina expectativa oculta.");

  b.h1("Passo 5 - Contrato simplificado");
  b.p("Contrato de 1 página basta para 90% dos casos. Cláusulas mínimas:");
  b.card("Objeto", "Descrição objetiva do entregável (formato, quantidade, canal, uso).");
  b.card("Prazo", "Data de início, data de entrega, ciclos de revisão inclusos.");
  b.card("Investimento", "Valor total, condições (ex.: 50% na aceitação, 50% na entrega). PIX + nota fiscal.");
  b.card("Direitos de uso", "Cliente adquire direito de uso [descrever: exclusivo/não-exclusivo, prazo, canais]. Autor mantém direito de portfólio.");
  b.card("Rescisão", "Qualquer parte pode encerrar com aviso prévio. Valor proporcional ao entregue.");
  b.card("Confidencialidade", "Informações do cliente não são compartilhadas. Uso em portfólio requer autorização.");

  b.h1("Passo 6 - Entrega e follow-up");
  b.p("A entrega é comercial, não só operacional. Estrutura de entrega:");
  b.bullet("Arquivo final + link de visualização (nunca só arquivo solto)");
  b.bullet("Vídeo curto (2 min) explicando as escolhas feitas na direção");
  b.bullet("Convite explícito para revisão em janela definida (ex.: 'até sexta')");
  b.bullet("Follow-up em 7 dias após aprovação com pergunta: 'como está performando?'");
  b.p("Cliente que responde bem ao follow-up é candidato natural a assinatura mensal. Cliente que some é caso de portfólio, não de relação continuada.");

  b.h1("Checklist do primeiro cliente");
  b.bullet("Portfólio de 3 peças coerentes montado");
  b.bullet("Preço definido para os 3 níveis, escrito antes da conversa");
  b.bullet("Script de abordagem testado em 5 alvos por semana");
  b.bullet("Proposta em template de 1 página pronto para editar");
  b.bullet("Contrato simplificado pronto para adaptar");
  b.bullet("Meta explícita: fechar 1º cliente em 30 dias");
  b.p("Método sem execução vira frustração. Execute pequeno, mas execute.");

  b.h1("Erros que travam a monetização");
  b.card("Cobrar por hora", "Iguala seu trabalho a serviço genérico. Cobre por peça ou por pacote — o cliente compra resultado.");
  b.card("Portfólio inflado", "Mais peças diluem a percepção de direção. 3 peças excelentes vendem mais que 30 medianas.");
  b.card("Não formalizar", "'Combinado por WhatsApp' vira dor. Contrato simples de 1 página protege ambos os lados.");
  b.card("Desconto na primeira venda", "Reduz o valor percebido de tudo depois. Prefira agregar (uma peça extra) do que baixar preço.");
  b.card("Sumir após a entrega", "O follow-up é onde nasce a segunda venda. Sem ele, cada cliente é o primeiro de novo.");

  return pdf.save();
}

// ================================================================
// MAIN
// ================================================================
async function main() {
  await mkdir("/tmp/bonuses", { recursive: true });

  // pdf-lib StandardFonts.Helvetica encodes WinAnsi (Latin-1) — acentos OK.
  const dummy = await PDFDocument.create();
  const fonts = {
    helv:      await dummy.embedFont(StandardFonts.Helvetica),
    helvBold:  await dummy.embedFont(StandardFonts.HelveticaBold),
    mono:      await dummy.embedFont(StandardFonts.Courier),
  };
  // Embed per document — pdf-lib fonts are per-doc.
  async function embed(pdf) {
    return {
      helv:     await pdf.embedFont(StandardFonts.Helvetica),
      helvBold: await pdf.embedFont(StandardFonts.HelveticaBold),
      mono:     await pdf.embedFont(StandardFonts.Courier),
    };
  }

  const jobs = [
    { file: "01-biblioteca-prompts-mestres.pdf", make: buildBonus01 },
    { file: "02-painel-referencias-visuais.pdf",  make: buildBonus02 },
    { file: "03-guia-integracao-4-midias.pdf",    make: buildBonus03 },
    { file: "04-kit-monetizacao-criativa.pdf",    make: buildBonus04 },
  ];

  for (const job of jobs) {
    const bytes = await job.make();
    const out = resolve("/tmp/bonuses", job.file);
    await writeFile(out, bytes);
    console.log(`OK ${out} (${(bytes.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
