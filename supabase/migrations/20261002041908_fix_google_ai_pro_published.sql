-- Corrige google-ai-pro: is_published deve ser true para o checkout PIX funcionar.
-- O registro existe e tem price=149.90, mas is_published=false fazia createPixCharge
-- lançar 'Curso indisponível' antes de ler o preço.

UPDATE courses
SET is_published = true
WHERE id = '18ddfd2c-4a9b-4e6f-b9f0-6c3e8a1d2b4f'
  AND slug = 'google-ai-pro'
  AND is_published = false;
