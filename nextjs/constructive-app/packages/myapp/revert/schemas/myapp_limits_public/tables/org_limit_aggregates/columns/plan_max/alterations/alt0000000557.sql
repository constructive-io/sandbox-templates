-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/plan_max/alterations/alt0000000557


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN plan_max DROP DEFAULT;


