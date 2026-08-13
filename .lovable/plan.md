# Plano: Sincronização e Restauração de Conteúdo (M1, M2, M4)

O usuário identificou que o conteúdo dos módulos anteriores (M1, M2 e M4) parece estar ausente ou não foi persistido corretamente no banco de dados, apesar de existirem registros de revisão. Este plano visa restaurar a densidade pedagógica premium em todos os módulos revisados.

## 1. Diagnóstico do Estado Atual
- **Módulo 0:** OK (Vídeo + Texto introdutório).
- **Módulo 1:** Registrado como revisado, mas banco mostra conteúdo genérico/ausente.
- **Módulo 2:** Documentação existe (`revisao-modulo-2.md`), mas precisa ser reaplicada ao banco.
- **Módulo 3:** OK (Confirmado no banco com conteúdo denso).
- **Módulo 4:** Documentação existe (`revisao-modulo-4.md`), mas banco mostra `content_text` nulo.

## 2. Ações de Correção (Execução Paralela)

### A. Restauração do Módulo 1 (Mentalidade e Nichos)
- Criar script de migração para injetar o conteúdo de `docs/production/revisao-modulo-1.md` (criado agora).
- Atualizar `questions` para o M1 com perguntas de alta profundidade.

### B. Restauração do Módulo 2 (Estratégia e Posicionamento)
- Re-injetar o conteúdo de `docs/production/revisao-modulo-2.md` no campo `content_text`.
- Garantir que `video_url` seja NULL.

### C. Restauração do Módulo 4 (Consistência Visual)
- Re-injetar o conteúdo de `docs/production/revisao-modulo-4.md` no campo `content_text`.
- Atualizar as questões do M4 (atualmente nulas ou genéricas).

### D. Atualização do Status Global
- Sincronizar `src/routes/index.tsx` para refletir a restauração completa.

## 3. Detalhes Técnicos
- Uso de `supabase--migration` para garantir que as alterações sejam permanentes.
- Verificação de `sort_order` para garantir que os IDs corretos sejam afetados.

## 4. Próximos Passos
- Após a restauração, prosseguir para o **Módulo 5: Fotografia Virtual e Still de Produto**.
