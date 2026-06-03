-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table


ALTER TABLE myapp_events_public.app_event_aggregates 
  ADD COLUMN updated_at timestamptz;

