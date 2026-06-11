-- Deploy: schemas/myapp_events_public/tables/org_level_grants/columns/updated_at/alterations/alt0000000997
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_public/tables/org_level_grants/columns/updated_at/column


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN updated_at SET DEFAULT now();

