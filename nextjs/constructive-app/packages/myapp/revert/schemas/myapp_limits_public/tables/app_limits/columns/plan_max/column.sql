-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/plan_max/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN plan_max RESTRICT;


