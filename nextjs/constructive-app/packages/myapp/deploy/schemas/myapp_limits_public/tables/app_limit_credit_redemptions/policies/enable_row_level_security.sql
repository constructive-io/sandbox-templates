-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ENABLE ROW LEVEL SECURITY;

