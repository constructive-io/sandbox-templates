-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/max_redemptions/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/table


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  ADD COLUMN max_redemptions int;

