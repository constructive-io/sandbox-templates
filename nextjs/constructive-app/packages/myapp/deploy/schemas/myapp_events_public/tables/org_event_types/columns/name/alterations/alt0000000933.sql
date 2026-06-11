-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/name/alterations/alt0000000933
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/name/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN name SET NOT NULL;

