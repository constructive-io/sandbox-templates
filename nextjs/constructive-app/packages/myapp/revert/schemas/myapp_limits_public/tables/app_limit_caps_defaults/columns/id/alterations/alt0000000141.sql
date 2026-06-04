-- Revert: schemas/myapp_limits_public/tables/app_limit_caps_defaults/columns/id/alterations/alt0000000141


ALTER TABLE myapp_limits_public.app_limit_caps_defaults 
  ALTER COLUMN id DROP NOT NULL;


