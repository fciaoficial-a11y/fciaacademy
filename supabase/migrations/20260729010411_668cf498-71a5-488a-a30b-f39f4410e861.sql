UPDATE public.modules SET content_text = $CONTENT$
Nos módulos 3 e 4 você deu **forma** e **movimento** ao projeto. Neste módulo você entrega o que fixa o projeto na memória do espectador: **som**. Música, textura, respiração e voz não são "trilha de fundo" — são o que faz o cérebro decidir se aquilo mereceu atenção. Sem som intencional, o vídeo mais bonito passa em branco. Com som certo, uma cena simples vira lembrança.

Aqui você aprende a **dirigir** trilha, ambiência e voz com IA — decidindo emoção, ritmo e identidade sonora — em vez de aceitar a primeira faixa que a plataforma sugere.

## Objetivo do módulo
Ao final desta aula você vai conseguir **especificar e dirigir** uma faixa musical, uma camada de ambiência e uma narração em voz com IA, alinhadas ao roteiro do M2, à identidade visual do M3 e ao movimento do M4. O critério é simples: **tira o som e a cena perde impacto**. Se puder tirar sem prejuízo, o som ainda não está fazendo trabalho.

## Camadas de som (o que existe em toda peça)
Toda peça audiovisual tem três camadas. Você precisa decidir cada uma antes de gerar qualquer coisa.

1. **Música** — a emoção base. Define se a cena é tensa, íntima, épica, contemplativa.
2. **Ambiência / SFX** — o mundo. Vento, sala, cidade, respiração. É o que dá **presença** e evita a sensação de "vídeo de IA flutuando no vazio".
3. **Voz** — a intenção humana. Narração, fala do personagem, sussurro. É o que **guia a leitura** da cena.

Regra de ouro: as três camadas coexistem, mas **só uma lidera por vez**. Quando a voz fala, a música respira. Quando a música cresce, a voz recua.

## Exemplo prático
Cena do M4: **operário olhando a cidade ao amanhecer**, câmera subindo devagar.

Direção sonora:
- **Música:** piano solo, andamento lento (~70 BPM), tom melancólico com resolução em maior no final. Sem percussão. Referência: trilhas de Jóhann Jóhannsson.
- **Ambiência:** vento leve em altura, murmúrio distante de cidade acordando, um pássaro solitário aos 4s.
- **Voz:** narração em off, tom grave, ritmo pausado, respiração audível entre frases. Frase-chave aos 6s: "*Todo dia começa antes da cidade lembrar.*"

Mixagem: música em -18 LUFS, ambiência em -24 LUFS, voz em -14 LUFS. A voz sempre 4-6 dB acima da música.

Esse é o padrão de **direção sonora**: cada camada tem função, referência, intensidade e momento.

## Prompt de direção sonora (template)
Para gerar música com IA (Suno, Udio, ElevenLabs Music), estruture assim:

```
[Emoção principal] + [Instrumento líder] + [Andamento em BPM] +
[Tom / Escala] + [Textura] + [Referência estética] +
[Arco: início → meio → fim] + [Duração] + [O que NÃO pode ter]
```

Exemplo aplicado:
> "Piano solo melancólico com resolução esperançosa. 70 BPM. Tom Ré menor migrando para Ré maior aos 40s. Textura íntima, com reverb curto, sem percussão, sem strings épicos. Referência: Jóhann Jóhannsson, *Arrival*. Início contemplativo, meio com respiração, fim em alívio. 60 segundos. Sem bateria, sem sintetizador, sem crescendo dramático."

Para voz (ElevenLabs, Play.ht):
> "Voz masculina brasileira, 40 anos, grave e pausada. Tom introspectivo, sem entonação publicitária. Respiração audível entre frases. Ritmo 130 palavras/min."

## Erros comuns
- **Escolher música pelo gosto pessoal em vez do papel narrativo.** A trilha serve a cena, não ao seu Spotify.
- **Empilhar camadas sem hierarquia.** Música + ambiência + voz + SFX todos no mesmo volume = ruído.
- **Ignorar a ambiência.** Vídeo bonito sem ambiência soa "falso de IA". Ambiência é o que ancora o espectador no mundo.
- **Voz genérica de IA.** Sem direção de tom, ritmo e respiração, a narração vira robô de call center.
- **Não normalizar o áudio final.** Cliente entrega em -6 LUFS estourando ou -30 LUFS inaudível.

## Checkpoint prático
Entregue um **bloco sonoro de 60-90 segundos** para a cena do M4, contendo:

1. **Ficha de direção sonora** (uma página): emoção, instrumento líder, BPM, tom, referência, arco, o que evitar.
2. **Faixa musical** gerada com IA, exportada em WAV/MP3.
3. **Camada de ambiência** (gerada ou de biblioteca) alinhada ao ambiente da cena.
4. **Narração em voz** de 2-3 frases, dirigida (tom, ritmo, respiração especificados).
5. **Mixagem final** com os três elementos, normalizada em -14 LUFS (padrão streaming).

Critério de aprovação: ao remover qualquer uma das três camadas, a cena **perde impacto perceptível**. Se alguma camada puder sair sem diferença, ela ainda não está fazendo trabalho — refaça a direção.

## Fechamento
Som não é decoração. É o que decide se o espectador **lembra** da peça amanhã. Um projeto criativo maduro tem direção sonora tão intencional quanto direção visual. Você agora tem as quatro mídias — texto, imagem, vídeo, som — sob a mesma vontade autoral.

## Próximo passo
No M6 você **integra** as quatro mídias em uma única peça coerente: roteiro (M2) → imagem (M3) → vídeo (M4) → som (M5), articulados por um mesmo eixo criativo. É onde o Método deixa de ser quatro habilidades e vira **uma linguagem**.
$CONTENT$,
duration_minutes = 45,
updated_at = now()
WHERE slug = 'aula-05-musica'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'metodo-ia-criativa');