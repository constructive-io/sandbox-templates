-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/policies/auth_del_delete_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/policies/enable_row_level_security


CREATE POLICY auth_del_delete_own ON myapp_memberships_public.org_memberships
FOR DELETE
TO authenticated
USING (
  actor_id = jwt_public.current_user_id() AND is_banned IS FALSE
);

