-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/columns/required_count/alterations/alt0000000352
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table
-- requires: schemas/myapp_events_public/tables/app_level_requirements/columns/required_count/column


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN required_count SET NOT NULL;

