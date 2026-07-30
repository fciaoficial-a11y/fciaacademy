-- FCIA Academy — liga/desliga triggers de efeito colateral durante a carga.
-- Rode SEMPRE no banco de DESTINO, nunca em produção ativa.
--
-- Desligar antes da Fase 4:
--   psql "$TARGET_DB_URL" -v mode=disable -f scripts/migration/toggle-triggers.sql
-- Religar depois:
--   psql "$TARGET_DB_URL" -v mode=enable  -f scripts/migration/toggle-triggers.sql

\set ON_ERROR_STOP on

DO $$
DECLARE
  v_mode text := current_setting('fcia.mode', true);
BEGIN
  NULL; -- placeholder: o modo real vem via :mode abaixo
END $$;

-- Tabelas cujos triggers geram XP, certificados ou profiles.
ALTER TABLE public.module_progress :mode TRIGGER ALL;
ALTER TABLE public.quiz_attempts   :mode TRIGGER ALL;
ALTER TABLE public.certificates    :mode TRIGGER ALL;
ALTER TABLE public.profiles        :mode TRIGGER ALL;
ALTER TABLE public.enrollments     :mode TRIGGER ALL;
ALTER TABLE public.courses         :mode TRIGGER ALL;

-- Lembrete: o trigger em auth.users (handle_new_user / assign_default_role /
-- assign_free_plan / auto_promote_admin) precisa ser tratado no painel do
-- projeto de destino antes da importação de usuários — o schema auth não é
-- alterável por migração.
