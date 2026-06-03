-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/columns/entity_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table


ALTER TABLE myapp_events_public.org_event_aggregates 
  ADD COLUMN entity_id uuid;

