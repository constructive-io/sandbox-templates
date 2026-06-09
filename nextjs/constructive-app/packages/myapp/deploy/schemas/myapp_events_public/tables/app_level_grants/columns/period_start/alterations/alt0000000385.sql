-- Deploy: schemas/myapp_events_public/tables/app_level_grants/columns/period_start/alterations/alt0000000385
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table
-- requires: schemas/myapp_events_public/tables/app_level_grants/columns/period_start/column


ALTER TABLE myapp_events_public.app_level_grants 
  ALTER COLUMN period_start SET NOT NULL;

