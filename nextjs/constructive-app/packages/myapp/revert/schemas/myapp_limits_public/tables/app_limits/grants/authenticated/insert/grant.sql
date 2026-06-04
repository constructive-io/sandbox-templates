-- Revert: schemas/myapp_limits_public/tables/app_limits/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_limits_public.app_limits FROM authenticated;


