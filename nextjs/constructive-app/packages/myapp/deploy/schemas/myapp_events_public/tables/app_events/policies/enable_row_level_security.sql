-- Deploy: schemas/myapp_events_public/tables/app_events/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table


ALTER TABLE myapp_events_public.app_events 
  ENABLE ROW LEVEL SECURITY;

