-- Deploy: schemas/myapp_events_public/tables/org_levels/columns/image/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table


ALTER TABLE myapp_events_public.org_levels 
  ADD COLUMN image image;

