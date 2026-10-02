-- Corrige is_published do Google AI Pro para checkout via PIX
-- Afeta SOMENTE o registro com slug google-ai-pro e price 149.90

UPDATE public.courses
SET    is_published = true
WHERE  slug  = 'google-ai-pro'
AND    price = 149.90
AND    is_published = false; -- no-op se já estiver publicado
