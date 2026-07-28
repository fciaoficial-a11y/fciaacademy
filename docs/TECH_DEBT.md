# FCIA Academy — Dívida Técnica

> Registro de itens técnicos identificados, avaliados e conscientemente
> adiados. Cada item traz o motivo do bloqueio e o plano de saída.

---

## 1. Remoção da coluna `tracks.required_plan`

- **Status:** 🔒 Bloqueado por dependências ativas.
- **Analisado em:** 2026-07-28 (Passo 5 do roadmap de cleanup).
- **Decisão:** adiado. Não remover agora.

### Por que não pode ser removida agora

A coluna `tracks.required_plan` ainda é lida por funções `SECURITY DEFINER`
que estão no **caminho crítico de runtime** do produto:

- `has_course_access(_user uuid, _course uuid)` — gate de acesso ao player
  e ao quiz.
- `enroll_in_course(_course_id uuid)` — matrícula (gratuita e pós-pagamento).
- `can_access_track(_user uuid, _track uuid)` — gate de trilhas.

Um `ALTER TABLE public.tracks DROP COLUMN required_plan` hoje quebraria em
produção:

- abertura de módulos do curso (player),
- início/entrega de quiz,
- matrícula automática após webhook PIX,
- listagem/acesso a trilhas.

Regra aplicada: **priorizar preservação em caso de dúvida**. A coluna fica.

### Plano futuro em 3 etapas (executar somente em sprint dedicado)

1. **Reescrever as funções** `has_course_access`, `enroll_in_course` e
   `can_access_track` para não lerem mais `required_plan`. O acesso já é
   totalmente determinado por:
   - `courses.price = 0` → acesso gratuito, e
   - existência de `enrollments` do usuário para o curso → acesso pago já
     liberado (via webhook Asaas / `grant_paid_access`).
2. **Validar em produção** que player, quiz, matrícula e trilhas continuam
   funcionando com as funções reescritas, sem qualquer leitura de
   `required_plan`. Monitorar por tempo suficiente antes de seguir.
3. **Só então** executar a migração destrutiva:
   ```sql
   ALTER TABLE public.tracks DROP COLUMN required_plan;
   ```

### Restrições ao mexer neste item no futuro

- Não reativar lógica de planos/assinaturas (`plans`, `subscriptions`,
  `plan_at_enrollment`) — a decisão de produto vigente é "sem planos".
  Ver `docs/PURCHASE_FLOW.md`.
- Não alterar o funil público (`/curso/:slug/oferta` → PIX → enrollment)
  como efeito colateral deste cleanup.
- Não tratar como refactor amplo: é uma sequência cirúrgica de 3 passos.
