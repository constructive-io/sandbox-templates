-- Deploy: schemas/myapp_events_public/tables/org_events/columns/entity_type/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table


ALTER TABLE myapp_events_public.org_events 
  ADD COLUMN entity_type text;

