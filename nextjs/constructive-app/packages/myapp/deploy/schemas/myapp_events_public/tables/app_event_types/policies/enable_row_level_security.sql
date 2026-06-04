-- Deploy: schemas/myapp_events_public/tables/app_event_types/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table


ALTER TABLE myapp_events_public.app_event_types 
  ENABLE ROW LEVEL SECURITY;

