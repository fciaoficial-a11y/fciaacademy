UPDATE public.certificate_settings
SET legal_footer = 'Curso livre de capacitação profissional, nos termos da Lei nº 9.394/1996 e do Decreto nº 5.154/2004.'
WHERE legal_footer IS NULL
   OR legal_footer ILIKE '%MEC%'
   OR legal_footer ILIKE '%sem equival%';