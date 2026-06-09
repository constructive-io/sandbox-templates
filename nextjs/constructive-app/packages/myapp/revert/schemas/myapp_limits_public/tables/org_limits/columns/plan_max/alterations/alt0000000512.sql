-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/plan_max/alterations/alt0000000512


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN plan_max DROP DEFAULT;


