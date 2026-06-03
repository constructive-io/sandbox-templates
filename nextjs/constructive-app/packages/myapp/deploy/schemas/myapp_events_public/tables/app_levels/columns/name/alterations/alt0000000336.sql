-- Deploy: schemas/myapp_events_public/tables/app_levels/columns/name/alterations/alt0000000336
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table
-- requires: schemas/myapp_events_public/tables/app_levels/columns/name/column


ALTER TABLE myapp_events_public.app_levels 
  ALTER COLUMN name SET NOT NULL;

