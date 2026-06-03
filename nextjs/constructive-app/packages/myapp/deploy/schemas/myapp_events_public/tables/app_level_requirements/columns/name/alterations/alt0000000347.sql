-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/columns/name/alterations/alt0000000347
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table
-- requires: schemas/myapp_events_public/tables/app_level_requirements/columns/name/column


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN name SET NOT NULL;

