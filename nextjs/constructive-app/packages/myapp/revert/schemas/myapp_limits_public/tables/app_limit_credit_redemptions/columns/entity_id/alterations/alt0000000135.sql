-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/entity_id/alterations/alt0000000135


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ALTER COLUMN entity_id DROP NOT NULL;


