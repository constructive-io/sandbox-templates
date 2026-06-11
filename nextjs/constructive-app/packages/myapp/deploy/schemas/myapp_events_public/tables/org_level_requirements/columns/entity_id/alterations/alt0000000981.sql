-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/entity_id/alterations/alt0000000981
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/entity_id/column


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN entity_id SET NOT NULL;

