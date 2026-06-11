-- Revert: schemas/myapp_limits_public/tables/app_limit_events/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_limits_public.app_limit_events FROM authenticated;


