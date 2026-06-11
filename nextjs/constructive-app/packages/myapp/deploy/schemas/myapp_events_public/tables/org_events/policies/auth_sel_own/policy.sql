-- Deploy: schemas/myapp_events_public/tables/org_events/policies/auth_sel_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_public/tables/org_events/policies/enable_row_level_security


CREATE POLICY auth_sel_own ON myapp_events_public.org_events
FOR SELECT
TO authenticated
USING (
  actor_id = jwt_public.current_user_id()
);

