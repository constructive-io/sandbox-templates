-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/grants/authenticated/select/grant


REVOKE SELECT ON myapp_limits_public.app_limit_credit_redemptions FROM authenticated;


