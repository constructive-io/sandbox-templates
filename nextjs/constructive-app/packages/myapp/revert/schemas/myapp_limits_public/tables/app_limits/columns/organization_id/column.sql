-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/organization_id/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN organization_id RESTRICT;


