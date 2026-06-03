-- Revert: schemas/myapp_events_public/tables/org_events/grants/authenticated/select/grant


REVOKE SELECT ON myapp_events_public.org_events FROM authenticated;


