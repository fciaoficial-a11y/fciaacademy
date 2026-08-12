-- Publicar o curso
UPDATE public.courses 
SET is_published = true 
WHERE slug = 'influenciador-ia-tiktok-shop';

-- Publicar todos os módulos do curso
UPDATE public.modules 
SET is_published = true 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop');