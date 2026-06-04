-- Revert: schemas/myapp_limits_public/tables/app_limit_defaults/columns/name/column


ALTER TABLE myapp_limits_public.app_limit_defaults 
  DROP COLUMN name RESTRICT;


