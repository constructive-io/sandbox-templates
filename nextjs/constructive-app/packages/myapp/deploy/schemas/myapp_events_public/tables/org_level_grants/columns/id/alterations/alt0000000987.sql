-- Deploy: schemas/myapp_events_public/tables/org_level_grants/columns/id/alterations/alt0000000987
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_public/tables/org_level_grants/columns/id/column


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN id SET DEFAULT uuidv7();

