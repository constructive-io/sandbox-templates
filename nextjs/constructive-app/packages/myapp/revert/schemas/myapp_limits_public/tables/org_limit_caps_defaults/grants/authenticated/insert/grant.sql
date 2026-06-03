-- Revert: schemas/myapp_limits_public/tables/org_limit_caps_defaults/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_limits_public.org_limit_caps_defaults FROM authenticated;


