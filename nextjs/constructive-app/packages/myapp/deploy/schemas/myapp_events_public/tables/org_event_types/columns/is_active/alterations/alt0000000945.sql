-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/is_active/alterations/alt0000000945
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/is_active/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN is_active SET DEFAULT true;

