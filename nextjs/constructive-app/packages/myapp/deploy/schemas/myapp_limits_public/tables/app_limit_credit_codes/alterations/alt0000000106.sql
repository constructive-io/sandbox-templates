-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/alterations/alt0000000106
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/table


COMMENT ON TABLE myapp_limits_public.app_limit_credit_codes IS E'Redeemable credit codes managed by admins with the add_credits permission';

