-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/period_credits/alterations/alt0000000561


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN period_credits DROP DEFAULT;


