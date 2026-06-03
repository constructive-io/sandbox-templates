-- Deploy: schemas/myapp_users_public/tables/users/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


CREATE POLICY auth_sel_all_all ON myapp_users_public.users
FOR SELECT
TO authenticated
USING (
  TRUE
);

