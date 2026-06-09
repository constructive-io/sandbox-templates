-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/created_at/alterations/alt0000000982
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/created_at/column


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN created_at SET DEFAULT now();

