# FCIA Academy — Modelo Operacional de Compra (estado oficial)

> **Última revisão:** 2026-07-28
> **Status:** vigente. Alterar apenas com decisão explícita de produto.

## Fluxo oficial de compra (1 curso por vez)

```
home / catálogo  →  /curso/:slug/oferta  →  checkout PIX direto  →  liberação de acesso
```

- A página `/curso/:slug/oferta` é o **único ponto de conversão pública**.
- O checkout é PIX direto (Asaas), disparado a partir do CTA da oferta,
  sem etapa intermediária de carrinho.
- A liberação de acesso é feita pelo webhook `/api/public/webhooks/asaas`
  via `grant_paid_access`, que cria o `enrollment` correspondente.
- **Padrão oficial: 1 curso por transação.** Não existe carrinho, combo
  ou pagamento agregando múltiplos cursos.

## O que NÃO existe (por decisão)

- ❌ Carrinho multi-item
- ❌ Página `/carrinho` ou `/cart`
- ❌ Checkout agregando múltiplos `course_id`
- ❌ Bundles, combos ou pacotes de cursos vendidos em uma única cobrança

Qualquer PR/tarefa que introduza esses conceitos deve ser rejeitada sem
uma decisão de produto formal registrada aqui.

## Quando reconsiderar carrinho multi-item

Carrinho **só** entra em sprint futuro se houver decisão explícita de:

1. Vender **bundles** (ex.: "IA Sem Mistério + Venda com IA" com preço agregado).
2. Vender **combos/trilhas pagas** como unidade única de cobrança.
3. Permitir múltiplos cursos no mesmo pagamento por outro motivo de negócio.

Nenhuma dessas condições está ativa hoje. Enquanto não estiver, o funil
permanece 1-curso-por-vez.

## Componentes que refletem essa decisão

- `src/routes/curso.$slug.oferta.tsx` — CTA único, `PixCheckout` embutido.
- `src/components/payments/PixCheckout.tsx` — recebe um único `courseId`.
- `src/routes/api/public/webhooks/asaas.ts` — libera acesso por curso.
- `src/lib/payments.ts` / `payments.functions.ts` — assinatura por curso.
- `src/components/site/StickyMobileCTA.tsx` — aponta para `/curso/:slug/oferta`,
  nunca para carrinho.

Se algum desses arquivos passar a aceitar múltiplos cursos, esta
documentação precisa ser atualizada **antes** do merge.
