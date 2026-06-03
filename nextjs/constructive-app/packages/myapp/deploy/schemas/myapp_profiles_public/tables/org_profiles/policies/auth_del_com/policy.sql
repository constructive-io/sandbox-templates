-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/policies/auth_del_com/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table


CREATE POLICY auth_del_com ON myapp_profiles_public.org_profiles
FOR DELETE
TO authenticated
USING (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      (org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000000000001000000') = '0000000000000000000000000000000000000000000000000000000001000000')) AND is_system IS FALSE
);

