-- Revert: schemas/myapp_limits_public/tables/app_limit_caps_defaults/columns/max/alterations/alt0000000146


ALTER TABLE myapp_limits_public.app_limit_caps_defaults 
  ALTER COLUMN max DROP DEFAULT;


