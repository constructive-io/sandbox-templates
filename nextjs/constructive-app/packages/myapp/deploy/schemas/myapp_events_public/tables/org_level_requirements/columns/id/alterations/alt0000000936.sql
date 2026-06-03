-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/id/alterations/alt0000000936
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/id/column


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN id SET DEFAULT uuidv7();

