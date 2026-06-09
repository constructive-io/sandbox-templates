-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/level/alterations/alt0000000972
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/level/column


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN level SET NOT NULL;

