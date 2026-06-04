-- Revert: schemas/myapp_events_public/tables/org_levels/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.org_levels FROM authenticated;


