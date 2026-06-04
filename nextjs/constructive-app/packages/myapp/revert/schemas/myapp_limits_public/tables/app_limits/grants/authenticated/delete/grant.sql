-- Revert: schemas/myapp_limits_public/tables/app_limits/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_limits_public.app_limits FROM authenticated;


