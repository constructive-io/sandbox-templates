-- Revert: schemas/myapp_limits_public/tables/app_limit_caps/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_limits_public.app_limit_caps FROM authenticated;


