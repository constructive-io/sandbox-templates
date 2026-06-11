-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/soft_max/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN soft_max RESTRICT;


