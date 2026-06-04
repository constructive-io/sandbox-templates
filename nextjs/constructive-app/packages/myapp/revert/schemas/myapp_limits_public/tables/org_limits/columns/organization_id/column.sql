-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/organization_id/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN organization_id RESTRICT;


