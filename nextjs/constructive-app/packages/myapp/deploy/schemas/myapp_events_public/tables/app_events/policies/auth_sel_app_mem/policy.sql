-- Deploy: schemas/myapp_events_public/tables/app_events/policies/auth_sel_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table
-- requires: schemas/myapp_events_public/tables/app_events/policies/enable_row_level_security


CREATE POLICY auth_sel_app_mem ON myapp_events_public.app_events
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000100000000000') = '0000000000000000000000000000000000000000000000000000100000000000')
);

