-- Curso Influenciadora com IA (rota /course/influencer-com-ia)
-- Cria o curso, os 5 modulos e 3 questoes de quiz por modulo.

do $$
declare
  v_course_id uuid;
  v_module_id uuid;
  rec record;
begin
  select id into v_course_id from public.courses where slug = 'influencer-com-ia' limit 1;

  if v_course_id is null then
    insert into public.courses (slug, title, description, price, is_free, is_published, workload_hours, allow_pdf_download)
    values (
      'influencer-com-ia',
      'Influenciadora com IA',
      'Crie, escale e monetize influenciadoras virtuais: identidade, realismo cinematografico, sincronia labial e operacao de vendas no TikTok Shop.',
      297.00,
      false,
      true,
      40,
      true
    )
    returning id into v_course_id;
  else
    update public.courses
       set is_published = true,
           price = case when price is null or price = 0 then 297.00 else price end
     where id = v_course_id;
  end if;

  for rec in
    select * from (values
      ('m1-dna-da-influenciadora', 'O DNA da Influenciadora', 'Posicionamento, arquetipo, promessa central e o modelo mental de quem opera uma influenciadora virtual como ativo de midia.', 1),
      ('m2-rosto-e-estetica', 'O Rosto e a Estetica', 'Construcao do seed mestre: rosto consistente, direcao de arte, paleta e guarda-roupa que fazem a personagem existir.', 2),
      ('m3-realismo-cinematografico', 'O Realismo Cinematografico', 'Luz, lente, pele e cenario: o que separa um avatar plastico de um video que parece gravado no mundo real.', 3),
      ('m4-movimento-fala-sincronia', 'Movimento, Fala e Sincronia Labial', 'Roteiro, voz, prosodia e lip-sync: como fazer a personagem falar com naturalidade e emocao.', 4),
      ('m5-escala-e-monetizacao', 'Escala e Monetizacao', 'Esteira de producao, testes de gancho, TikTok Shop e transformacao de audiencia em receita recorrente.', 5)
    ) as t(mod_slug, mod_title, mod_description, mod_position)
  loop
    select id into v_module_id
      from public.modules
     where course_id = v_course_id and slug = rec.mod_slug
     limit 1;

    if v_module_id is null then
      insert into public.modules (course_id, slug, title, description, content_type, duration_minutes, sort_order)
      values (v_course_id, rec.mod_slug, rec.mod_title, rec.mod_description, 'text', 30, rec.mod_position)
      returning id into v_module_id;
    end if;

    insert into public.questions (module_id, question, type, options, correct_answer, explanation, sort_order, status)
    select v_module_id,
           'Qual e o primeiro passo ao produzir este conteudo do modulo ' || rec.mod_title || '?',
           'multiple_choice',
           array['Definir objetivo e referencia antes de gerar', 'Gerar dezenas de variacoes aleatorias', 'Publicar sem revisar', 'Comprar seguidores para o perfil'],
           'Definir objetivo e referencia antes de gerar',
           'Metodo antes de ferramenta: objetivo e referencia vem antes de qualquer geracao.',
           1,
           'approved'
     where not exists (
       select 1 from public.questions q where q.module_id = v_module_id and q.sort_order = 1
     );

    insert into public.questions (module_id, question, type, options, correct_answer, explanation, sort_order, status)
    select v_module_id,
           'O que garante consistencia visual da influenciadora entre videos?',
           'multiple_choice',
           array['O seed mestre com referencias fixas', 'Trocar de ferramenta a cada video', 'Variar o rosto para parecer natural', 'Usar apenas filtros prontos'],
           'O seed mestre com referencias fixas',
           'O seed mestre e a referencia fixa que mantem o mesmo rosto em qualquer cenario.',
           2,
           'approved'
     where not exists (
       select 1 from public.questions q where q.module_id = v_module_id and q.sort_order = 2
     );

    insert into public.questions (module_id, question, type, options, correct_answer, explanation, sort_order, status)
    select v_module_id,
           'Qual metrica indica que o video esta pronto para escalar?',
           'multiple_choice',
           array['Retencao e taxa de clique no carrinho', 'Numero de seguidores', 'Quantidade de hashtags', 'Duracao do video'],
           'Retencao e taxa de clique no carrinho',
           'Escala vem de retencao e clique: e o que mostra que o gancho e a oferta funcionam.',
           3,
           'approved'
     where not exists (
       select 1 from public.questions q where q.module_id = v_module_id and q.sort_order = 3
     );
  end loop;
end $$;
