-- Deploy: schemas/myapp_invites_public/tables/app_invites/policies/auth_sel_dir_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


CREATE POLICY auth_sel_dir_own ON myapp_invites_public.app_invites
FOR SELECT
TO authenticated
USING (
  sender_id = jwt_public.current_user_id()
);

