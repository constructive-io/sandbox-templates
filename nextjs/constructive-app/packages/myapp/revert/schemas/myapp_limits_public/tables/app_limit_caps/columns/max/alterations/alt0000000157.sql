-- Revert: schemas/myapp_limits_public/tables/app_limit_caps/columns/max/alterations/alt0000000157


ALTER TABLE myapp_limits_public.app_limit_caps 
  ALTER COLUMN max DROP DEFAULT;


