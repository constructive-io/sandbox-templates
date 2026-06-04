-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/default_limit_id/alterations/alt0000000518


ALTER TABLE myapp_limits_public.org_limit_credits 
  ALTER COLUMN default_limit_id DROP NOT NULL;


