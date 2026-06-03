-- Deploy: schemas/myapp_events_public/tables/app_level_grants/alterations/alt0000000360
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


ALTER TABLE myapp_events_public.app_level_grants 
  DISABLE ROW LEVEL SECURITY;

