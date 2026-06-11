-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_limits_public.app_limit_credit_redemptions FROM authenticated;


