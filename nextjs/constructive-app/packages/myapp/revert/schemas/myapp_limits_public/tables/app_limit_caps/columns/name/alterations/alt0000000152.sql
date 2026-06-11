-- Revert: schemas/myapp_limits_public/tables/app_limit_caps/columns/name/alterations/alt0000000152


ALTER TABLE myapp_limits_public.app_limit_caps 
  ALTER COLUMN name DROP NOT NULL;


