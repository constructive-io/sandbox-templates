-- Revert: schemas/myapp_events_public/tables/org_event_types/grants/authenticated/select/grant


REVOKE SELECT ON myapp_events_public.org_event_types FROM authenticated;


