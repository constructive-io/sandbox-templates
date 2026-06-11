-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/actor_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table


ALTER TABLE myapp_events_public.app_event_aggregates 
  ADD COLUMN actor_id uuid;

