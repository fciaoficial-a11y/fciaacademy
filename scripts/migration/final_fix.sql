BEGIN;
-- Garantir que temos o Módulo 0 correto e remover o rascunho anterior
DELETE FROM public.modules 
WHERE course_id = 'e23cf598-23be-4dbe-b8f0-4c3a420d9b62' 
AND title = 'MÓDULO 0 — A Nova Era do Social Commerce';

-- Atualizar o Módulo 0 para ser o primeiro (sort_order 0)
UPDATE public.modules 
SET sort_order = 0 
WHERE course_id = 'e23cf598-23be-4dbe-b8f0-4c3a420d9b62' 
AND title = 'Módulo 0 — Boas-vindas, Visão Geral e Método do Curso';
COMMIT;
