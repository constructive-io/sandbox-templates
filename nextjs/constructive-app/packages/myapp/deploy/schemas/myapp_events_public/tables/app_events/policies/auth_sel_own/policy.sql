-- Deploy: schemas/myapp_events_public/tables/app_events/policies/auth_sel_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table


CREATE POLICY auth_sel_own ON myapp_events_public.app_events
FOR SELECT
TO authenticated
USING (
  actor_id = jwt_public.current_user_id()
);

