-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/name/alterations/alt0000000970
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/name/column


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN name SET NOT NULL;

