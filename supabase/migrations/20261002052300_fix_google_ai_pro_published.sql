-- Corrige google-ai-pro: garante is_published=true para checkout PIX funcionar.
-- Afeta SOMENTE o registro com slug google-ai-pro e price 149.90.

UPDATE public.courses
SET    is_published = true
WHERE  slug  = 'google-ai-pro'
AND    price = 149.90;