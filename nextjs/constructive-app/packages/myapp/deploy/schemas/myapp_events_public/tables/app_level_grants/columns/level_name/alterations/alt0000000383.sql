-- Deploy: schemas/myapp_events_public/tables/app_level_grants/columns/level_name/alterations/alt0000000383
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table
-- requires: schemas/myapp_events_public/tables/app_level_grants/columns/level_name/column


ALTER TABLE myapp_events_public.app_level_grants 
  ALTER COLUMN level_name SET NOT NULL;

