-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table


GRANT SELECT ON myapp_limits_public.app_limit_credit_redemptions TO authenticated;

