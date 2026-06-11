-- Deploy: schemas/myapp_events_public/tables/org_level_grants/columns/period_start/alterations/alt0000000992
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_public/tables/org_level_grants/columns/period_start/column


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN period_start SET NOT NULL;

