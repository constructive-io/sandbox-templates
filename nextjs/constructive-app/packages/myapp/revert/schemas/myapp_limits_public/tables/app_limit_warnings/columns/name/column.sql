-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/columns/name/column


ALTER TABLE myapp_limits_public.app_limit_warnings 
  DROP COLUMN name RESTRICT;


