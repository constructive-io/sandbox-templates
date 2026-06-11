-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/organization_id/column


ALTER TABLE myapp_limits_public.org_limit_credits 
  DROP COLUMN organization_id RESTRICT;


