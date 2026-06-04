-- Revert: schemas/myapp_events_public/tables/org_levels/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.org_levels FROM authenticated;


