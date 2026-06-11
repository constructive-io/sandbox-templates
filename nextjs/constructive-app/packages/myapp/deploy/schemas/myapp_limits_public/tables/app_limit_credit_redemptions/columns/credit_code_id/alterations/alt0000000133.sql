-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/credit_code_id/alterations/alt0000000133
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/credit_code_id/column


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ALTER COLUMN credit_code_id SET NOT NULL;

