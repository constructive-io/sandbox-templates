-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/created_at/alterations/alt0000000952
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/created_at/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN created_at SET DEFAULT now();

