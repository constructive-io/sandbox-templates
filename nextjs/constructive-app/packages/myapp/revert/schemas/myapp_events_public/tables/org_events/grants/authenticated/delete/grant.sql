-- Revert: schemas/myapp_events_public/tables/org_events/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.org_events FROM authenticated;


