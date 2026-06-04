-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/period_credits/alterations/alt0000000501


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN period_credits DROP DEFAULT;


