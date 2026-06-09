-- Deploy: schemas/myapp_permissions_public/tables/app_permission_defaults/policies/auth_ins_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/table
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/policies/enable_row_level_security


CREATE POLICY auth_ins_app_mem ON myapp_permissions_public.app_permission_defaults
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000000001000000') = '0000000000000000000000000000000000000000000000000000000001000000')
);

