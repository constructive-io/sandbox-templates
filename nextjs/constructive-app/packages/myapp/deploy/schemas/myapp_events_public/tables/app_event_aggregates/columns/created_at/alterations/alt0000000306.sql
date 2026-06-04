-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/created_at/alterations/alt0000000306
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/created_at/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN created_at SET DEFAULT now();

