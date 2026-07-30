# FCIA Academy — Documento Mestre do Projeto

> **Versão:** 1.0
> **Data de emissão:** 30/07/2026
> **Classificação:** documento institucional interno da FCIA
> **Fonte de evidência:** código-fonte do repositório, migrações em `supabase/migrations/` e consulta direta ao banco de produção em 30/07/2026.

**Convenção de marcação usada em todo o documento:**

| Marca | Significado |
| --- | --- |
| **[FATO]** | Verificado em código, migração ou consulta ao banco. |
| **[HIPÓTESE]** | Inferência plausível, ainda sem evidência direta. |
| **[RECOMENDAÇÃO]** | Proposta de ação, não implementada. |
| **[NÃO VALIDADO]** | Informação necessária que não pôde ser confirmada nesta auditoria. |

---

## 1. Visão geral do projeto

**[FATO]** A FCIA Academy é uma plataforma web de educação profissional aplicada, com catálogo próprio de cursos e materiais digitais, venda direta ao consumidor final, controle de acesso por matrícula, acompanhamento de progresso, avaliação por quiz e emissão de certificado digital com validação pública.

**[FATO]** O produto opera em modelo de **compra avulsa por produto**: cada curso ou material é vendido individualmente, sem planos, assinaturas, carrinho ou pacotes. A regra vigente é binária:

| Condição | Efeito |
| --- | --- |
| `courses.price = 0` | Acesso gratuito mediante matrícula |
| `courses.price > 0` | Exige matrícula ativa originada de pagamento confirmado |

**[FATO]** A plataforma é também um Progressive Web App (PWA) instalável, com manifesto, ícones e prompt de instalação próprios.

---

## 2. Objetivo de negócio

**[FATO]** Objetivos evidenciados pela implementação atual:

1. Comercializar produtos educacionais digitais da FCIA de forma autônoma, sem intermediação de marketplaces ou plataformas de terceiros.
2. Reduzir dependência de gateways de infoproduto, processando pagamento via **PIX direto (Asaas)** e liberando acesso automaticamente por webhook.
3. Entregar valor percebido superior por meio de certificação digital verificável publicamente, materiais bônus e trilha de progresso gamificada.
4. Sustentar um funil público de conversão próprio (landing de oferta por produto), com capacidade de teste A/B e upsell pós-compra.

**[NÃO VALIDADO]** Metas quantitativas de negócio (faturamento-alvo, volume de alunos, CAC, ticket médio-alvo) não estão registradas no repositório.

---

## 3. Escopo funcional da plataforma

### 3.1 Ambiente público (visitante)

| Função | Rota | Status |
| --- | --- | --- |
| Home institucional e vitrine | `/` | Implementado |
| Catálogo com busca e filtros | `/cursos` | Implementado |
| Landing de oferta por curso | `/curso/:slug/oferta` | Implementado |
| Landing dedicada do e-book | `/ebook-ia-sem-complicacao` | Implementado |
| Página institucional para empresas | `/empresas` | Implementado |
| Validação pública de certificado | `/validar-certificado/:codigo` | Implementado |
| Sitemap dinâmico | `/sitemap.xml` | Implementado |
| Cadastro, login e recuperação de senha | `/register`, `/login`, `/forgot-password`, `/reset-password` | Implementado |

### 3.2 Ambiente do aluno (autenticado)

| Função | Rota | Status |
| --- | --- | --- |
| Painel do aluno | `/dashboard` | Implementado |
| Consumo do curso (vídeo, PDF seguro, texto) | `/curso/:slug` | Implementado |
| Quiz com aprovação mínima de 70% | `/quiz/:moduleId` | Implementado |
| Certificados do aluno | `/certificados`, `/certificados/:id` | Implementado |
| Evolução, XP, níveis e conquistas | `/evolucao` | Implementado |
| Perfil | `/profile` | Implementado |
| Entrega do e-book adquirido | `/ebook-ia-sem-complicacao/entrega` | Implementado |

### 3.3 Ambiente administrativo

| Função | Rota | Status |
| --- | --- | --- |
| Visão geral e indicadores | `/admin` | Implementado |
| Gestão de cursos, módulos, trilhas | `/admin/cursos`, `/admin/modulos`, `/admin/trilhas` | Implementado |
| Banco de questões | `/admin/questoes` | Implementado |
| Certificados e configuração institucional | `/admin/certificados` | Implementado |
| Pagamentos | `/admin/pagamentos` | Implementado |
| Usuários | `/admin/usuarios` | Implementado |
| Gerador de curso com IA e AI Studio | `/admin/gerar-curso`, `/admin/ai-studio` | Implementado |
| Produção de conteúdo | `/admin/producao` | Implementado |
| Troca de senha administrativa | `/admin/senha` | Implementado |

**[FATO]** Os ambientes de aluno e administrador possuem shells visuais separados (`AppShell` e `AdminShell`) e diferenciação cromática por contexto (visitante, aluno, administrador).

---

## 4. Arquitetura geral

### 4.1 Modelo arquitetural

**[FATO]** Aplicação full-stack única em TanStack Start, com renderização no servidor em runtime serverless de edge e backend gerenciado (PostgreSQL + Auth + Storage) acessado tanto pelo cliente (sob RLS) quanto por funções de servidor.

```
Navegador / PWA
   │
   ├─ Rotas públicas (SSR + hidratação)
   ├─ Rotas autenticadas (gate de sessão)
   │
   ├─ createServerFn  ──► lógica interna de servidor (PDF, pagamentos, IA, storage)
   └─ /api/public/webhooks/asaas ──► endpoint HTTP externo (webhook do gateway)
                    │
                    ▼
        PostgreSQL gerenciado (RLS + funções SECURITY DEFINER)
        Auth (e-mail/senha)   Storage (PDFs, vídeos, capas)
```

### 4.2 Camadas de segurança

**[FATO]**

1. **RLS habilitada** em todas as tabelas públicas, com `GRANT` explícito por papel.
2. **Papéis em tabela separada** (`user_roles` + enum `app_role`), verificados pela função `has_role` (`SECURITY DEFINER`) — sem papel armazenado em `profiles`.
3. **Gate de acesso a conteúdo** centralizado em `has_course_access`, que exige, para curso pago, matrícula ativa ou papel de administrador.
4. **Entrega de arquivos** via funções `SECURITY DEFINER` que resolvem o caminho no Storage (`get_module_pdf_path`, `get_bonus_download_path`, `get_module_intro_video_path`), nunca por caminho público.
5. **Webhook do gateway** com registro de idempotência em `gateway_events`.

### 4.3 Modelo de dados (resumo)

| Domínio | Tabelas |
| --- | --- |
| Catálogo | `tracks`, `courses`, `modules`, `questions`, `course_bonuses` |
| Identidade e acesso | `profiles`, `user_roles`, `enrollments` |
| Aprendizado | `module_progress`, `quiz_attempts` |
| Certificação | `certificates`, `certificate_settings` |
| Gamificação | `xp_log`, `achievements`, `user_achievements` |
| Comercial | `payments`, `gateway_events`, `bonus_downloads` |
| Legado em desativação | `plans`, `subscriptions`, `tracks.required_plan` |

**[FATO]** O schema é versionado em `supabase/migrations/` (**61 migrações**), definido como fonte única da verdade em `docs/GITHUB_SOURCE_OF_TRUTH.md`.

---

## 5. Stack tecnológica

| Camada | Tecnologia | Versão em uso |
| --- | --- | --- |
| Framework | TanStack Start (React 19) | 1.x / React 19.2 |
| Roteamento | TanStack Router (file-based) | 1.x |
| Build | Vite | 8.x |
| Estado de servidor | TanStack Query | 5.x |
| Estilo | Tailwind CSS | 4.x |
| Componentes | shadcn/ui sobre Radix UI | — |
| Animação | Framer Motion | 12.x |
| Formulários e validação | React Hook Form + Zod | 7.x / 3.x |
| Banco, Auth e Storage | PostgreSQL gerenciado (Lovable Cloud) | — |
| Geração de PDF | pdf-lib | 1.17 |
| Leitura de PDF | react-pdf / pdfjs-dist | 10.x / 6.x |
| QR Code | qrcode / qrcode.react | 1.5 / 4.2 |
| Gráficos | Recharts | 2.x |
| Runtime de servidor | Worker de edge (SSR + server functions) | — |
| Linguagem | TypeScript | 5.8 |

---

## 6. Fluxos principais do sistema

### 6.1 Compra e liberação de acesso (fluxo oficial)

**[FATO]** Um produto por transação. Não existe carrinho.

```
/cursos  →  /curso/:slug/oferta  →  PixCheckout (Asaas)
   →  pagamento PIX confirmado
   →  webhook POST /api/public/webhooks/asaas
   →  idempotência em gateway_events
   →  grant_paid_access(user, plan, course)
   →  enrollment criado  →  acesso liberado
```

### 6.2 Consumo e progresso

```
/curso/:slug  →  gate has_course_access
   →  módulo (vídeo | PDF seguro | texto)
   →  mark_module_complete()  →  module_progress + XP
   →  liberação do quiz por get_quiz_eligibility()
```

### 6.3 Avaliação e certificação

```
Quiz (questões sorteadas por assemble_exam)
   →  quiz_attempts  →  nota ≥ 70% = aprovado
   →  trigger issue_certificate_on_pass
   →  certificado com código de validação + QR
   →  PDF gerado (pdf-lib) + página pública /validar-certificado/:codigo
```

### 6.4 Gamificação

```
Login diário  →  register_daily_login()  →  streak + XP
Módulo concluído / quiz aprovado / certificado emitido
   →  award_xp()  →  xp_log  →  compute_level()  →  check_achievements()
```

### 6.5 Entrega de e-book

```
Compra do produto product_type = 'ebook'
   →  enrollment  →  /ebook-ia-sem-complicacao/entrega (rota protegida)
   →  download do arquivo pela plataforma
```

---

## 7. Dependências externas

| Dependência | Função | Criticidade | Observação |
| --- | --- | --- | --- |
| Lovable Cloud (PostgreSQL, Auth, Storage) | Backend integral | **Crítica** | Indisponibilidade derruba login, conteúdo e pagamento |
| Asaas | Cobrança PIX e webhook de confirmação | **Crítica** | Sem ele não há liberação automática de acesso |
| Lovable (hospedagem e build) | Deploy do front e do runtime SSR | **Crítica** | Domínio publicado: `fciaacademy.lovable.app` |
| Lovable AI Gateway | Geração de curso e conteúdo no admin | Média | Falha afeta apenas ferramentas administrativas |
| WhatsApp (link externo) | Canal de suporte comercial | Baixa | Ponto de contato, não bloqueia operação |
| E-mail transacional | Envio do link de entrega pós-compra | — | **Não implementado**; depende de domínio próprio |

---

## 8. Status atual do projeto

### 8.1 Inventário de conteúdo (banco de produção, 30/07/2026)

| Indicador | Valor |
| --- | --- |
| Cursos cadastrados | 6 |
| Cursos publicados | 4 |
| Módulos | 35 |
| Questões aprovadas | 122 |
| Trilhas | 6 |
| Bônus cadastrados | 4 |
| Usuários (perfis) | 9 |
| Matrículas | 4 |
| Certificados emitidos | 1 |
| Pagamentos registrados | 3 |

### 8.2 Catálogo

| Produto | Tipo | Preço (R$) | Carga | Certificado | Publicado |
| --- | --- | --- | --- | --- | --- |
| Método IA Criativa: Masterclass | Curso | 249,90 | 120 h | Sim | Sim |
| IA Sem Mistério | Curso | 149,90 | 80 h | Sim | Sim |
| Venda com IA | Curso | 49,90 | 40 h | Sim | Sim |
| IA Sem Complicação — Guia + Bônus | E-book | 37,90 | — | Não | Sim |
| Fundamentos de IA para Profissionais | Curso | 47,00 | 20 h | Sim | Não |
| Método Influencer IA Commerce | Curso | 0,00 | 80 h | Sim | Não (standby) |

### 8.3 Situação por frente

| Frente | Situação | Evidência |
| --- | --- | --- |
| Autenticação e papéis | Operacional | `user_roles` + `has_role`; admin master ativo |
| Gate de acesso pago | Operacional | Patch aplicado em `has_course_access` |
| Checkout PIX | Operacional | Pagamentos de teste confirmados manualmente |
| Progresso e quiz (70%) | Operacional | `mark_module_complete`, `assemble_exam`, `quiz_attempts` |
| Certificação | Operacional | 1 certificado emitido e validável |
| Gamificação | Operacional com ressalva | Trigger duplicado removido; XP histórico reconciliado por lançamento de ajuste |
| Bônus do Masterclass | Operacional | 4 PDFs publicados com download controlado |
| PWA | Operacional | Manifesto, ícones e prompt de instalação |
| E-mail transacional | **Pendente** | Requer domínio próprio |
| Repositório GitHub oficial | **Pendente** | Nenhum repo conectado (`docs/GITHUB_SOURCE_OF_TRUTH.md`) |
| Migração para Supabase próprio | Planejada, não executada | `docs/MIGRATION_TO_OWN_SUPABASE.md` |
| Suíte de testes automatizados | **Inexistente** | Nenhuma dependência de teste em `package.json` |

---

## 9. Riscos identificados

| # | Risco | Tipo | Impacto | Probabilidade | Mitigação |
| --- | --- | --- | --- | --- | --- |
| R1 | Ausência de repositório GitHub oficial conectado — código e migrações sem cópia externa versionada | **[FATO]** | Alto | Média | Conectar `fcia-academy` conforme Fase 0 do runbook |
| R2 | Dependência integral de um único provedor de backend e hospedagem | **[FATO]** | Alto | Baixa | Executar `docs/MIGRATION_TO_OWN_SUPABASE.md` |
| R3 | Ausência de testes automatizados (unitários e E2E) | **[FATO]** | Alto | Alta | Cobrir primeiro: auth, gate de acesso pago, webhook, emissão de certificado |
| R4 | Falha ou atraso do webhook Asaas deixa pagamento confirmado sem liberação de acesso | **[FATO]** | Alto | Baixa | Rotina de reconciliação `payments` × `enrollments` e liberação manual no admin |
| R5 | Ausência de e-mail transacional: comprador depende de permanecer logado para acessar a entrega | **[FATO]** | Médio | Alta | Contratar domínio próprio e ativar envio pós-pagamento |
| R6 | Legado `tracks.required_plan` ainda lido por funções críticas de runtime | **[FATO]** | Médio | Baixa | Sequência de 3 passos em `docs/TECH_DEBT.md` |
| R7 | Triggers de efeito colateral (XP, certificado) podem gerar duplicidade em cargas de dados | **[FATO]** | Médio | Média | `scripts/migration/toggle-triggers.sql` antes de qualquer importação |
| R8 | Volume real de tráfego e conversão ainda não observado em escala | **[HIPÓTESE]** | Médio | — | Instrumentar analytics antes de campanha paga |
| R9 | Conteúdo dos cursos publicados pode conter lacunas de avaliação por módulo | **[NÃO VALIDADO]** | Médio | — | Auditoria de cobertura via `question_bank_coverage()` |

---

## 10. Próximos passos recomendados

Todos os itens abaixo são **[RECOMENDAÇÃO]**.

| Prioridade | Ação | Resultado esperado |
| --- | --- | --- |
| P0 | Conectar o repositório GitHub oficial `fcia-academy` | Código e migrações com cópia externa e histórico auditável |
| P0 | Implementar rotina de reconciliação pagamento × matrícula no admin | Elimina risco de compra paga sem acesso |
| P1 | Contratar domínio próprio e ativar e-mail transacional de entrega | Comprador recebe acesso por e-mail, sem depender de sessão ativa |
| P1 | Criar suíte mínima de testes (auth, gate pago, webhook, certificado) | Regressão detectada antes da publicação |
| P1 | Auditar cobertura de questões por módulo publicado | Garante que todo curso certificável tem avaliação completa |
| P2 | Executar a migração para Supabase próprio conforme runbook | Independência de infraestrutura |
| P2 | Instrumentar analytics de funil (`/cursos` → oferta → pagamento) | Base quantitativa para decisão comercial |
| P3 | Concluir a remoção do legado `tracks.required_plan` | Redução de dívida técnica |
| P3 | Publicar os dois cursos em rascunho após revisão editorial | Ampliação do catálogo comercial |

---

## 11. Quadro de situação atual

| Dimensão | Situação | Classificação |
| --- | --- | --- |
| Produto comercializável | Catálogo com 4 produtos publicados e preços definidos | ✅ Operacional |
| Funil de venda | Home → catálogo → oferta → PIX → acesso, funcionando ponta a ponta | ✅ Operacional |
| Pagamento | PIX Asaas com webhook idempotente; pagamentos de teste validados | ✅ Operacional |
| Controle de acesso | RLS em todas as tabelas, gate por matrícula, papéis segregados | ✅ Operacional |
| Experiência de aprendizado | Vídeo, PDF seguro, quiz 70%, progresso, XP e conquistas | ✅ Operacional |
| Certificação | Emissão automática, PDF, QR e validação pública | ✅ Operacional |
| Entrega pós-compra por e-mail | Não implementada | ⚠️ Pendente |
| Versionamento externo (GitHub) | Não conectado | ⚠️ Pendente |
| Testes automatizados | Inexistentes | ⛔ Crítico |
| Independência de infraestrutura | Planejada, não executada | ⚠️ Pendente |
| **Situação global** | **Plataforma apta a vender e entregar; pendências concentradas em governança técnica (versionamento, testes) e comunicação pós-compra.** | ✅ com ressalvas |

---

*Documento gerado a partir de evidência direta do repositório e do banco de produção em 30/07/2026. Qualquer alteração de escopo, preço ou arquitetura exige nova versão deste documento.*
