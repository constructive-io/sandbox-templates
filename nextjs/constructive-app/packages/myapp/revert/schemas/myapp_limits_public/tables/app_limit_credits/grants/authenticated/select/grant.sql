-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/grants/authenticated/select/grant


REVOKE SELECT ON myapp_limits_public.app_limit_credits FROM authenticated;


