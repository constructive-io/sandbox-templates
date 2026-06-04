-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/name/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN name RESTRICT;


