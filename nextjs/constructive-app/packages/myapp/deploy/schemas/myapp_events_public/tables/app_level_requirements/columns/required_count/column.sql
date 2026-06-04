-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/columns/required_count/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table


ALTER TABLE myapp_events_public.app_level_requirements 
  ADD COLUMN required_count int;

