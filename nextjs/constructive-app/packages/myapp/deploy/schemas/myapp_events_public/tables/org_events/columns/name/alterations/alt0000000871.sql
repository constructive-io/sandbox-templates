-- Deploy: schemas/myapp_events_public/tables/org_events/columns/name/alterations/alt0000000871
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_public/tables/org_events/columns/name/column


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN name SET NOT NULL;

