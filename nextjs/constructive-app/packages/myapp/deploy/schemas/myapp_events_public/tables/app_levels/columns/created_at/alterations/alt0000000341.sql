-- Deploy: schemas/myapp_events_public/tables/app_levels/columns/created_at/alterations/alt0000000341
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table
-- requires: schemas/myapp_events_public/tables/app_levels/columns/created_at/column


ALTER TABLE myapp_events_public.app_levels 
  ALTER COLUMN created_at SET DEFAULT now();

