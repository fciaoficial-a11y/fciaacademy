-- Restaura preço do Método IA Criativa para R$ 249,90 após teste de PIX de R$ 5,00
UPDATE public.courses
SET price = 249.90
WHERE slug = 'metodo-ia-criativa';
