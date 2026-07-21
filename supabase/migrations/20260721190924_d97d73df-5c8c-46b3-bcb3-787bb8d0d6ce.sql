ALTER TABLE public.certificate_settings
  ADD COLUMN IF NOT EXISTS template_key TEXT NOT NULL DEFAULT 'dark_premium_tech'
    CHECK (template_key IN ('executive_tech', 'dark_premium_tech', 'editorial_prestige'));