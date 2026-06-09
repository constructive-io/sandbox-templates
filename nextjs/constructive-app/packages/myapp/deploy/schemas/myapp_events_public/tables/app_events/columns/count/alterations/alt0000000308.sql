-- Deploy: schemas/myapp_events_public/tables/app_events/columns/count/alterations/alt0000000308
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table
-- requires: schemas/myapp_events_public/tables/app_events/columns/count/column


ALTER TABLE myapp_events_public.app_events 
  ALTER COLUMN count SET NOT NULL;

