-- Deploy: schemas/myapp_events_public/tables/org_events/columns/entity_id/alterations/alt0000000876
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_public/tables/org_events/columns/entity_id/column


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN entity_id SET NOT NULL;

