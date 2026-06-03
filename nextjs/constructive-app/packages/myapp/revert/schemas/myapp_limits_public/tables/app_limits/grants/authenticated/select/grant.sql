-- Revert: schemas/myapp_limits_public/tables/app_limits/grants/authenticated/select/grant


REVOKE SELECT ON myapp_limits_public.app_limits FROM authenticated;


