-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/entity_id/alterations/alt0000000135
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/entity_id/column


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ALTER COLUMN entity_id SET NOT NULL;

