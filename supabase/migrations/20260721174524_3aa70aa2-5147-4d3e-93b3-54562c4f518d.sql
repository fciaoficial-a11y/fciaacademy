
-- 1) Default publish = false
ALTER TABLE public.courses ALTER COLUMN is_published SET DEFAULT false;

-- 2) Campo is_free (marcação explícita)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false;

-- 3) Trigger de integridade para publicação
CREATE OR REPLACE FUNCTION public.enforce_course_publish_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published = true THEN
    IF NEW.is_free = false AND (NEW.price IS NULL OR NEW.price <= 0) THEN
      RAISE EXCEPTION 'Curso não pode ser publicado sem preço definido. Marque como gratuito ou informe um preço maior que zero.';
    END IF;
    IF NEW.workload_hours IS NULL OR NEW.workload_hours <= 0 THEN
      RAISE EXCEPTION 'Curso não pode ser publicado sem carga horária definida (workload_hours > 0).';
    END IF;
    IF NEW.title IS NULL OR length(btrim(NEW.title)) = 0
       OR NEW.description IS NULL OR length(btrim(NEW.description)) = 0
       OR NEW.slug IS NULL OR length(btrim(NEW.slug)) = 0 THEN
      RAISE EXCEPTION 'Curso não pode ser publicado sem título, descrição e slug.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_courses_publish_rules ON public.courses;
CREATE TRIGGER trg_courses_publish_rules
BEFORE INSERT OR UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.enforce_course_publish_rules();

-- 4) Corrigir cursos existentes
UPDATE public.courses
   SET workload_hours = 60,
       price = 497.00,
       is_free = false
 WHERE slug = 'ia-sem-misterio';

UPDATE public.courses
   SET workload_hours = 20,
       price = 197.00,
       is_free = false
 WHERE slug = 'ia-fundamentos-profissionais';
