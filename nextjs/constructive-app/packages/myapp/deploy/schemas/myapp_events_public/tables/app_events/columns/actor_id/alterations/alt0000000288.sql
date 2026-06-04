-- Deploy: schemas/myapp_events_public/tables/app_events/columns/actor_id/alterations/alt0000000288
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table
-- requires: schemas/myapp_events_public/tables/app_events/columns/actor_id/column


ALTER TABLE myapp_events_public.app_events 
  ALTER COLUMN actor_id SET DEFAULT jwt_public.current_user_id();

