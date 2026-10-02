-- Migration: cria campanha de bônus para os 10 primeiros pagantes do Google AI Pro
-- Segura para reaplicação: ON CONFLICT DO NOTHING + validação do curso de origem
-- Não usa UUID fixo, não faz DROP, não altera objetos existentes

-- Validação: o curso de bônus (metodo-ia-criativa) precisa existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.courses WHERE slug = 'metodo-ia-criativa'
  ) THEN
    RAISE EXCEPTION 'Curso metodo-ia-criativa não encontrado; campanha nao criada.';
  END IF;
END $$;

-- Insere a campanha APENAS se ainda nao existir (slug como unique key)
INSERT INTO public.bonus_campaigns (
  id,
  slug,
  name,
  bonus_type,
  bonus_target,
  max_allocations,
  allocated_count,
  is_active,
  starts_at,
  ends_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  'google-ai-pro-10-first',
  'Google AI Pro — bonus para os 10 primeiros pagantes',
  'course',
  c.id,
  10,
  0,
  true,
  now(),
  NULL,
  now(),
  now()
FROM public.courses c
WHERE c.slug = 'metodo-ia-criativa'
ON CONFLICT (slug) DO NOTHING;
