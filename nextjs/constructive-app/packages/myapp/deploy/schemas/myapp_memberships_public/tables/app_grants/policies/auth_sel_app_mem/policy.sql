-- Deploy: schemas/myapp_memberships_public/tables/app_grants/policies/auth_sel_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/table


CREATE POLICY auth_sel_app_mem ON myapp_memberships_public.app_grants
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000000000000001') = '0000000000000000000000000000000000000000000000000000000000000001')
);

