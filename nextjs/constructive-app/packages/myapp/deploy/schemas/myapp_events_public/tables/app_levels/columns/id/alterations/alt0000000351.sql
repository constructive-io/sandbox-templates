-- Deploy: schemas/myapp_events_public/tables/app_levels/columns/id/alterations/alt0000000351
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table
-- requires: schemas/myapp_events_public/tables/app_levels/columns/id/column


ALTER TABLE myapp_events_public.app_levels 
  ALTER COLUMN id SET NOT NULL;

