-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/max/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN max RESTRICT;


