-- Adiciona google-ai-pro à visible_plans para que get_active_plan encontre o curso
INSERT INTO visible_plans (course_id, plan_id, price, duration_days, is_active, created_at)
SELECT 
  c.id,
  'google-ai-pro-18m',
  149.90,
  547,
  true,
  NOW()
FROM courses c
WHERE c.slug = 'google-ai-pro'
  AND c.is_published = true
  AND c.id NOT IN (SELECT course_id FROM visible_plans WHERE plan_id = 'google-ai-pro-18m');
