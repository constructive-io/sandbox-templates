-- Deploy: schemas/myapp_events_public/tables/app_events/alterations/alt0000000282
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table


ALTER TABLE myapp_events_public.app_events 
  DISABLE ROW LEVEL SECURITY;

