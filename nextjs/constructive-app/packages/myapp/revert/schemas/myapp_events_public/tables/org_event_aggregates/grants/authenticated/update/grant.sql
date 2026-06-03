-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_events_public.org_event_aggregates FROM authenticated;


