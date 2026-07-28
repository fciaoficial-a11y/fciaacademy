<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Modelo operacional de compra (vigente)

Funil oficial: **home/catálogo → `/curso/:slug/oferta` → checkout PIX direto → liberação de acesso**.

- 1 curso por transação. **Não existe carrinho, combo ou bundle.**
- Carrinho multi-item só entra em sprint futuro com decisão de produto
  explícita (venda de bundles/trilhas pagas). Sem essa decisão, PRs que
  introduzam carrinho devem ser rejeitados.
- Detalhes e pontos de código impactados: [`docs/PURCHASE_FLOW.md`](./docs/PURCHASE_FLOW.md).
