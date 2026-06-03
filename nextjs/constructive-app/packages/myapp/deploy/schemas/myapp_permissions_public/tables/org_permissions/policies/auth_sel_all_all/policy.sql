-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


CREATE POLICY auth_sel_all_all ON myapp_permissions_public.org_permissions
FOR SELECT
TO authenticated
USING (
  TRUE
);

