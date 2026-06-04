-- Revert: schemas/myapp_events_public/tables/org_event_types/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.org_event_types FROM authenticated;


