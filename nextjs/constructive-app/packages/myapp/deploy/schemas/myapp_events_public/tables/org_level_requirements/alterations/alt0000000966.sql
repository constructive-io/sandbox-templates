-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/alterations/alt0000000966
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table


ALTER TABLE myapp_events_public.org_level_requirements 
  DISABLE ROW LEVEL SECURITY;

