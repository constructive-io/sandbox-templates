-- Deploy: schemas/myapp_events_public/tables/org_event_types/alterations/alt0000000896
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table


ALTER TABLE myapp_events_public.org_event_types 
  DISABLE ROW LEVEL SECURITY;

