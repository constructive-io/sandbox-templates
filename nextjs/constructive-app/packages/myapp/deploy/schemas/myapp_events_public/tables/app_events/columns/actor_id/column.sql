-- Deploy: schemas/myapp_events_public/tables/app_events/columns/actor_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table


ALTER TABLE myapp_events_public.app_events 
  ADD COLUMN actor_id uuid;

