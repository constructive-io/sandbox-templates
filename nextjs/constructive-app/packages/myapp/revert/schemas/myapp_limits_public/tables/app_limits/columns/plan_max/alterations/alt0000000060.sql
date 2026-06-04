-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/plan_max/alterations/alt0000000060


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN plan_max DROP DEFAULT;


