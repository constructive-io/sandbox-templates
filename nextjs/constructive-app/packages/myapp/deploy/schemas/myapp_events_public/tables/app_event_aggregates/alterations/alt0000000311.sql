-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/alterations/alt0000000311
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table


ALTER TABLE myapp_events_public.app_event_aggregates 
  DISABLE ROW LEVEL SECURITY;

