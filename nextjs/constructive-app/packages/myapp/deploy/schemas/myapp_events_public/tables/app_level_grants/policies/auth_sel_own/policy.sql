-- Deploy: schemas/myapp_events_public/tables/app_level_grants/policies/auth_sel_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table
-- requires: schemas/myapp_events_public/tables/app_level_grants/policies/enable_row_level_security


CREATE POLICY auth_sel_own ON myapp_events_public.app_level_grants
FOR SELECT
TO authenticated
USING (
  actor_id = jwt_public.current_user_id()
);

