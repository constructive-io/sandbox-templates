-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/grants/authenticated/select/grant


REVOKE SELECT ON myapp_limits_public.org_limit_caps FROM authenticated;


