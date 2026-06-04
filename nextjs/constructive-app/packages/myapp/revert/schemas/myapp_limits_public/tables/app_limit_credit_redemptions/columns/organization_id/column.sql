-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/organization_id/column


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  DROP COLUMN organization_id RESTRICT;


