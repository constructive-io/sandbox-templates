-- Deploy: schemas/myapp_invites_public/tables/app_invites/policies/auth_ins_create_invite_check/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/policies/enable_row_level_security


CREATE POLICY auth_ins_create_invite_check ON myapp_invites_public.app_invites
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000000000000010') = '0000000000000000000000000000000000000000000000000000000000000010')
);

