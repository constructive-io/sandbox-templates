-- Deploy: schemas/myapp_events_public/tables/app_level_grants/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


ALTER TABLE myapp_events_public.app_level_grants 
  ADD COLUMN created_at timestamptz;

