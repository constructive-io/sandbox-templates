-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/plan_max/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN plan_max RESTRICT;


