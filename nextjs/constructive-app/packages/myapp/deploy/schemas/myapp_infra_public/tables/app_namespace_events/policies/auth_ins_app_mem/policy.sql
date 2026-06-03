-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/policies/auth_ins_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


CREATE POLICY auth_ins_app_mem ON myapp_infra_public.app_namespace_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND app_sprt.is_admin IS TRUE)
);

