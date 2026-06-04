-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/purchased_credits/alterations/alt0000000544


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN purchased_credits DROP DEFAULT;


