-- Revert: schemas/myapp_limits_public/tables/org_limits/grants/authenticated/select/grant


REVOKE SELECT ON myapp_limits_public.org_limits FROM authenticated;


