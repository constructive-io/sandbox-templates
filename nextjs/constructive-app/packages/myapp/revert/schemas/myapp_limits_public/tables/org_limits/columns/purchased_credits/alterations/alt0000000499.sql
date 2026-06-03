-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/purchased_credits/alterations/alt0000000499


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN purchased_credits DROP DEFAULT;


