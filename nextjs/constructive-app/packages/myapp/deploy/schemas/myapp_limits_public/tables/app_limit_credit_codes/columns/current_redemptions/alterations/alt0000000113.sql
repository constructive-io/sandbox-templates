-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/current_redemptions/alterations/alt0000000113
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/current_redemptions/column


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  ALTER COLUMN current_redemptions SET DEFAULT 0;

