-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_grants/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_grants/policies/enable_row_level_security


CREATE POLICY auth_sel_all_all ON myapp_memberships_public.app_permission_default_grants
FOR SELECT
TO authenticated
USING (
  TRUE
);

