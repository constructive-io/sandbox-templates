-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/policies/auth_upd_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/policies/enable_row_level_security


CREATE POLICY auth_upd_app_mem ON myapp_infra_public.app_namespaces
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000001000000000000') = '0000000000000000000000000000000000000000000000000001000000000000')
);

