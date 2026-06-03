-- Deploy: schemas/myapp_users_public/tables/users/policies/auth_del_com/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


CREATE POLICY auth_del_com ON myapp_users_public.users
FOR DELETE
TO authenticated
USING (
  id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND org_sprt.is_owner IS TRUE)
);

