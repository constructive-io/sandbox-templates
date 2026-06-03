-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/alterations/alt0000000129
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  DISABLE ROW LEVEL SECURITY;

