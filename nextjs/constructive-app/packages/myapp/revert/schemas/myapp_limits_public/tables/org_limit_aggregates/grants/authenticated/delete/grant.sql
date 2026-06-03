-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_limits_public.org_limit_aggregates FROM authenticated;


