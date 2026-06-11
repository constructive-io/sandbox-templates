-- Deploy: schemas/myapp_events_public/tables/org_level_grants/columns/period_start/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table


ALTER TABLE myapp_events_public.org_level_grants 
  ADD COLUMN period_start timestamptz;

