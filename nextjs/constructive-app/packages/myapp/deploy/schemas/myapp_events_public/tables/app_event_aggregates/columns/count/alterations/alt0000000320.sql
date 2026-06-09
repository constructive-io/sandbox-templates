-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/count/alterations/alt0000000320
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/count/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN count SET DEFAULT 0;

