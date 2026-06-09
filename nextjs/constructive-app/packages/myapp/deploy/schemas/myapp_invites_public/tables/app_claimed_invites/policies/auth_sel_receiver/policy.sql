-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/policies/auth_sel_receiver/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/table
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/policies/enable_row_level_security


CREATE POLICY auth_sel_receiver ON myapp_invites_public.app_claimed_invites
FOR SELECT
TO authenticated
USING (
  receiver_id = jwt_public.current_user_id()
);

