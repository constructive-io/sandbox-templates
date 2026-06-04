-- Revert: schemas/myapp_limits_public/tables/app_limit_caps_defaults/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_limits_public.app_limit_caps_defaults FROM authenticated;


