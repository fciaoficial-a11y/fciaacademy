
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
      RAISE EXCEPTION 'Curso não pode ser publicado sem preço definido. Marque como gratuito ou informe um preço maior que zero.';
    END IF;

    IF NEW.workload_hours IS NULL OR NEW.workload_hours <= 0 THEN
      RAISE EXCEPTION 'Curso não pode ser publicado sem carga horária definida (workload_hours > 0).';
    END IF;

    IF NEW.cover_url IS NULL OR NEW.cover_url !~* '^https?://.+' THEN
      RAISE EXCEPTION 'Curso não pode ser publicado sem capa. Envie uma imagem ou informe uma URL https válida.';
    END IF;

    SELECT COUNT(*) INTO v_published_modules
      FROM public.modules
     WHERE course_id = NEW.id AND is_published = true;

    IF v_published_modules < 3 THEN
      RAISE EXCEPTION 'Curso precisa de pelo menos 3 módulos publicados para ir ao ar. Publicados agora: %.', v_published_modules;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
