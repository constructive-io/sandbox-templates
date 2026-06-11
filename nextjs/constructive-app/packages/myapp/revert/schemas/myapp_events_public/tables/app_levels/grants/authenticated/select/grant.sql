-- Revert: schemas/myapp_events_public/tables/app_levels/grants/authenticated/select/grant


REVOKE SELECT ON myapp_events_public.app_levels FROM authenticated;


