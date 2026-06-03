-- Deploy: schemas/myapp_events_public/tables/org_levels/columns/id/alterations/alt0000000924
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_levels/columns/id/column


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN id SET DEFAULT uuidv7();

