-- Revert: schemas/myapp_limits_public/tables/app_limit_events/grants/authenticated/select/grant


REVOKE SELECT ON myapp_limits_public.app_limit_events FROM authenticated;


