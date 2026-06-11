-- Verify: schemas/myapp_events_public/tables/org_levels/indexes/org_levels_updated_at_idx


SELECT verify_index('myapp_events_public.org_levels', 'org_levels_updated_at_idx');


