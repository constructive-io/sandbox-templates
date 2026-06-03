-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/is_active/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table


ALTER TABLE myapp_events_public.org_event_types 
  ADD COLUMN is_active boolean;

