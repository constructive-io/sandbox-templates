-- Deploy: schemas/myapp_events_public/tables/app_event_types/policies/auth_ins_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table


CREATE POLICY auth_ins_app_mem ON myapp_events_public.app_event_types
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000000010000000') = '0000000000000000000000000000000000000000000000000000000010000000')
);

