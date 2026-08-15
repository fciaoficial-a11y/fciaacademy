-- Confirmando o estado atual antes da alteração
SELECT c.id, c.title, c.is_published, t.title as track_title, c.price 
FROM courses c 
LEFT JOIN tracks t ON c.track_id = t.id 
WHERE c.slug = 'influenciador-ia-tiktok-shop';

-- Aplicando as correções solicitadas
UPDATE tracks SET title = 'Renda com IA' WHERE title = 'Renda com IA e Freelas';
UPDATE courses SET is_published = false WHERE slug = 'influenciador-ia-tiktok-shop';

-- Verificação pós-alteração
SELECT c.id, c.title, c.is_published, t.title as track_title, c.price 
FROM courses c 
LEFT JOIN tracks t ON c.track_id = t.id 
WHERE c.slug = 'influenciador-ia-tiktok-shop';