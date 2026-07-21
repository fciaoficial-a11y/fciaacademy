
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS full_pdf_path TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS complementary_content TEXT;

UPDATE public.courses
   SET full_pdf_path = 'full-pdfs/ia-sem-misterio.pdf'
 WHERE slug = 'ia-sem-misterio';
