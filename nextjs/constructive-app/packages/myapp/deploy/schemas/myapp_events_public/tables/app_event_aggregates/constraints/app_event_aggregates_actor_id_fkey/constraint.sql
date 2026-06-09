-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/constraints/app_event_aggregates_actor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table


ALTER TABLE myapp_events_public.app_event_aggregates 
  ADD CONSTRAINT app_event_aggregates_actor_id_fkey 
    FOREIGN KEY(actor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

