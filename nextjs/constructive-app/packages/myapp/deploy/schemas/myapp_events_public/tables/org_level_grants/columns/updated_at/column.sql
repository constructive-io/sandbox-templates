-- Deploy: schemas/myapp_events_public/tables/org_level_grants/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table


ALTER TABLE myapp_events_public.org_level_grants 
  ADD COLUMN updated_at timestamptz;

