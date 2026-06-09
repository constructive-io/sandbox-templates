-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/id/alterations/alt0000000531


ALTER TABLE myapp_limits_public.org_limit_credits 
  ALTER COLUMN id DROP NOT NULL;


