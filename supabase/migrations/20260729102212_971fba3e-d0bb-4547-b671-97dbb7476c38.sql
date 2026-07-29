-- 1) Novas colunas em courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'course'
    CHECK (product_type IN ('course','ebook')),
  ADD COLUMN IF NOT EXISTS delivery_url TEXT;

-- 2) Trigger de publicação: pular regras de módulos/carga para ebook
CREATE OR REPLACE FUNCTION public.enforce_course_publish_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_published_modules INTEGER;
BEGIN
  IF NEW.is_published = true THEN
    IF NEW.title IS NULL OR length(btrim(NEW.title)) = 0
       OR NEW.description IS NULL OR length(btrim(NEW.description)) < 40
       OR NEW.slug IS NULL OR length(btrim(NEW.slug)) = 0 THEN
      RAISE EXCEPTION 'Curso não pode ser publicado sem título, slug e promessa principal (descrição com pelo menos 40 caracteres).';
    END IF;

    IF NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
      RAISE EXCEPTION 'Slug inválido. Use apenas minúsculas, números e hífens (ex.: venda-com-ia).';
    END IF;

    IF NEW.is_free = false AND (NEW.price IS NULL OR NEW.price <= 0) THEN
      RAISE EXCEPTION 'Curso/ebook não pode ser publicado sem preço definido. Marque como gratuito ou informe um preço maior que zero.';
    END IF;

    IF NEW.cover_url IS NULL OR NEW.cover_url !~* '^(https?://|/).+' THEN
      RAISE EXCEPTION 'Curso/ebook não pode ser publicado sem capa. Envie uma imagem ou informe uma URL válida.';
    END IF;

    IF NEW.product_type = 'ebook' THEN
      IF NEW.delivery_url IS NULL OR length(btrim(NEW.delivery_url)) = 0 THEN
        RAISE EXCEPTION 'Ebook não pode ser publicado sem link de entrega (delivery_url).';
      END IF;
    ELSE
      IF NEW.workload_hours IS NULL OR NEW.workload_hours <= 0 THEN
        RAISE EXCEPTION 'Curso não pode ser publicado sem carga horária definida (workload_hours > 0).';
      END IF;

      SELECT COUNT(*) INTO v_published_modules
        FROM public.modules
       WHERE course_id = NEW.id AND is_published = true;

      IF v_published_modules < 3 THEN
        RAISE EXCEPTION 'Curso precisa de pelo menos 3 módulos publicados para ir ao ar. Publicados agora: %.', v_published_modules;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3) Seed do ebook (idempotente)
INSERT INTO public.courses (
  track_id, slug, title, description,
  duration_minutes, level, cover_url, sort_order,
  is_published, workload_hours, price,
  certificate_enabled, allow_pdf_download, is_free,
  product_type, delivery_url
) VALUES (
  '12ec915f-ad6c-4537-9891-f67b67982eec',
  'ia-sem-complicacao',
  'IA Sem Complicação — Guia + Bônus',
  'O guia definitivo para dominar Inteligência Artificial no dia a dia, sem termos técnicos. Ebook em PDF + bônus "50 tarefas para vender usando IA" — leitura em uma tarde, aplicação imediata.',
  60, 'iniciante',
  '/__l5e/assets-v1/656ad43f-0cd2-4d17-8feb-5b72862d0d30/ebook-cover-official.png',
  999,
  true, 1, 47.90,
  false, true, false,
  'ebook',
  'https://drive.google.com/drive/folders/1vWe1OUgBDr1BepCSjFoqjda6nD04l6cS'
)
ON CONFLICT (slug) DO UPDATE SET
  product_type = EXCLUDED.product_type,
  delivery_url = EXCLUDED.delivery_url,
  price = EXCLUDED.price,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  cover_url = EXCLUDED.cover_url,
  is_published = true,
  is_free = false,
  updated_at = now();