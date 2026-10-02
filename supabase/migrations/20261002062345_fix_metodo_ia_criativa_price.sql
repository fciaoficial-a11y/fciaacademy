-- Corrige preço do Método IA Criativa para R$ 5.00 (teste PIX Asaas)
UPDATE public.courses
SET price = 5.00
WHERE slug = 'metodo-ia-criativa';
