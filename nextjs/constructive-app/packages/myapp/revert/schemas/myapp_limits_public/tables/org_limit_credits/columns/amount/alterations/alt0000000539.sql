-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/amount/alterations/alt0000000539


ALTER TABLE myapp_limits_public.org_limit_credits 
  ALTER COLUMN amount DROP NOT NULL;


