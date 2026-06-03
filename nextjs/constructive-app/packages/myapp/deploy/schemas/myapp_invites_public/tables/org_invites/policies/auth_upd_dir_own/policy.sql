-- Deploy: schemas/myapp_invites_public/tables/org_invites/policies/auth_upd_dir_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


CREATE POLICY auth_upd_dir_own ON myapp_invites_public.org_invites
FOR UPDATE
TO authenticated
USING (
  sender_id = jwt_public.current_user_id()
);

