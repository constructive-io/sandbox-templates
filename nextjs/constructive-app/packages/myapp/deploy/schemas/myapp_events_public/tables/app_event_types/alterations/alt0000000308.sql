-- Deploy: schemas/myapp_events_public/tables/app_event_types/alterations/alt0000000308
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table


ALTER TABLE myapp_events_public.app_event_types 
  DISABLE ROW LEVEL SECURITY;

