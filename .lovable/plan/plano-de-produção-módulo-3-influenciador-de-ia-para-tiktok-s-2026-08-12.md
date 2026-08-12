# Plano de Produção: Módulo 3 — Influenciador de IA para TikTok Shop

Este plano descreve a implementação do Módulo 3, focado na criação da identidade estratégica e visual do influenciador virtual, mantendo o curso em standby (não publicado).

## Alterações Técnicas

### 1. Banco de Dados (Supabase)
- **Inserção do Módulo 3**: Criar o registro na tabela `modules` com `order_index: 3`, associado ao curso `influenciador-ia-tiktok-shop`.
- **Produção de Aulas**: Criar 5 aulas densas cobrindo os 31 pontos da estrutura obrigatória.
- **Quiz do Módulo 3**: Inserir 10 questões estratégicas na tabela `public.questions` focadas em identidade, arquétipos e consistência visual.
- **Configurações**: Garantir que o curso permaneça com `is_published = false`.

### 2. Documentação e Memória
- **Documento Mestre**: Atualizar `docs/ARQUITETURA_CURSO_INFLUENCIADOR_IA.md` marcando o Módulo 3 como concluído.
- **Memória do Projeto**: Atualizar `mem://features/curso-influenciador-ia-arquitetura.md`.
- **Diretiva de Código**: Atualizar o comentário técnico no topo de `src/routes/index.tsx`.

## Conteúdo Pedagógico (Módulo 3)

### Aulas Propostas:
1. **Fundamentos da Identidade Virtual**: Personagem vs. Persona vs. Marca. Conceito central e posicionamento.
2. **Arquitetura da Personalidade e Voz**: Definição de valores, arquétipos, tom de voz e manual verbal.
3. **Design da Aparência e Estilo**: Definição física, vestuário, acessórios e consistência visual repetível.
4. **Narrativa e Ambientação**: História de origem (backstory), cenários estratégicos e relação com a audiência.
5. **A Ficha-Mestra (Master Prompting)**: Transformando a identidade em prompts estruturados para IA.

---

## Detalhes Técnicos
- Utilizar `public.questions` para o quiz.
- Manter o preço de R$ 137,00 e a trilha "Renda com IA".
- Seguir o padrão de profundidade técnica da FCIA Academy.
