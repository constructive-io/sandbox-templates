-- Deploy: schemas/myapp_invites_public/tables/org_invites/policies/auth_ins_create_invite_check/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


CREATE POLICY auth_ins_create_invite_check ON myapp_invites_public.org_invites
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000000000000000010') = '0000000000000000000000000000000000000000000000000000000000000010')
);

