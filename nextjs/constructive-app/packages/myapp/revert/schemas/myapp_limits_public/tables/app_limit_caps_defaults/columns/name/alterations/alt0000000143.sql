-- Revert: schemas/myapp_limits_public/tables/app_limit_caps_defaults/columns/name/alterations/alt0000000143


ALTER TABLE myapp_limits_public.app_limit_caps_defaults 
  ALTER COLUMN name DROP NOT NULL;


