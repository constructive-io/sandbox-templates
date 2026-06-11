-- Deploy: schemas/myapp_users_public/tables/users/policies/auth_upd_com/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_users_public/tables/users/policies/enable_row_level_security


CREATE POLICY auth_upd_com ON myapp_users_public.users
FOR UPDATE
TO authenticated
USING (
  id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000000000100000000') = '0000000000000000000000000000000000000000000000000000000100000000')
);

