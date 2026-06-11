-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/actor_id/alterations/alt0000000315
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/actor_id/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN actor_id SET NOT NULL;

