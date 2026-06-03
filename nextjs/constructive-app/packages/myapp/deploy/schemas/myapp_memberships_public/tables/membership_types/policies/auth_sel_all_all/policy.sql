-- Deploy: schemas/myapp_memberships_public/tables/membership_types/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/table


CREATE POLICY auth_sel_all_all ON myapp_memberships_public.membership_types
FOR SELECT
TO authenticated
USING (
  TRUE
);

