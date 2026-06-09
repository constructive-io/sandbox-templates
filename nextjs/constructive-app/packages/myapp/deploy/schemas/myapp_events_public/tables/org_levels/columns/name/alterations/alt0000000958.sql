-- Deploy: schemas/myapp_events_public/tables/org_levels/columns/name/alterations/alt0000000958
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_levels/columns/name/column


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN name SET NOT NULL;

