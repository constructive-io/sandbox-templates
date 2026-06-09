-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/updated_at/alterations/alt0000000953
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/updated_at/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN updated_at SET DEFAULT now();

