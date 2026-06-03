-- Deploy: schemas/myapp_store_public/tables/app_config/policies/auth_sel_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table


CREATE POLICY auth_sel_app_mem ON myapp_store_public.app_config
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND app_sprt.is_admin IS TRUE)
);

