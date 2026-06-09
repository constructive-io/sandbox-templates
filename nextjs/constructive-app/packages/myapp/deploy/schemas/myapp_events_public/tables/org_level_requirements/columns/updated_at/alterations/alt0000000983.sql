-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/updated_at/alterations/alt0000000983
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/updated_at/column


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN updated_at SET DEFAULT now();

