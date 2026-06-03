-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/feeds_levels/alterations/alt0000000914
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/feeds_levels/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN feeds_levels SET NOT NULL;

