-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/updated_at/alterations/alt0000000324
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/updated_at/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN updated_at SET DEFAULT now();

