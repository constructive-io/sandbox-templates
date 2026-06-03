-- Deploy: schemas/myapp_events_public/tables/org_levels/columns/updated_at/alterations/alt0000000932
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_levels/columns/updated_at/column


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN updated_at SET DEFAULT now();

