-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/entity_id/alterations/alt0000000918
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/entity_id/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN entity_id SET NOT NULL;

