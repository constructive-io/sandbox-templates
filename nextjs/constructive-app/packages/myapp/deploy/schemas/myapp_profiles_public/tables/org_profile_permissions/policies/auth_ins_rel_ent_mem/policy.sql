-- Deploy: schemas/myapp_profiles_public/tables/org_profile_permissions/policies/auth_ins_rel_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/table


CREATE POLICY auth_ins_rel_ent_mem ON myapp_profiles_public.org_profile_permissions
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (SELECT obj.id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt INNER JOIN myapp_profiles_public.org_profiles AS obj ON org_sprt.entity_id = obj.entity_id
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000000000001000000') = '0000000000000000000000000000000000000000000000000000000001000000')
);

