-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/columns/priority/alterations/alt0000000355
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table
-- requires: schemas/myapp_events_public/tables/app_level_requirements/columns/priority/column


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN priority SET NOT NULL;

