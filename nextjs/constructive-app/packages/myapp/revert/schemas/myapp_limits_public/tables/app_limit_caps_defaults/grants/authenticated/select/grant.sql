-- Revert: schemas/myapp_limits_public/tables/app_limit_caps_defaults/grants/authenticated/select/grant


REVOKE SELECT ON myapp_limits_public.app_limit_caps_defaults FROM authenticated;


