-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/alterations/alt0000000343
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table


ALTER TABLE myapp_events_public.app_level_requirements 
  DISABLE ROW LEVEL SECURITY;

