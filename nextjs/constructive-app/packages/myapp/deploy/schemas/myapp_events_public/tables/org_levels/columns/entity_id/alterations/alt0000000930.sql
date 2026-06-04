-- Deploy: schemas/myapp_events_public/tables/org_levels/columns/entity_id/alterations/alt0000000930
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_levels/columns/entity_id/column


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN entity_id SET NOT NULL;

