-- Revert: schemas/myapp_limits_public/tables/org_limits/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_limits_public.org_limits FROM authenticated;


