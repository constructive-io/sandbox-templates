-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/policies/auth_sel_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/policies/enable_row_level_security


CREATE POLICY auth_sel_own ON myapp_memberships_public.app_memberships
FOR SELECT
TO authenticated
USING (
  actor_id = jwt_public.current_user_id()
);

