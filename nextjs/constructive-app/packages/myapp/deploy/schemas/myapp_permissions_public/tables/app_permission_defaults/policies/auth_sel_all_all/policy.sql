-- Deploy: schemas/myapp_permissions_public/tables/app_permission_defaults/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/table


CREATE POLICY auth_sel_all_all ON myapp_permissions_public.app_permission_defaults
FOR SELECT
TO authenticated
USING (
  TRUE
);

