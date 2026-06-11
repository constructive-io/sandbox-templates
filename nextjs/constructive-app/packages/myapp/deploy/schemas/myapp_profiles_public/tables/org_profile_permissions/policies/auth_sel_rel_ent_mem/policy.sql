-- Deploy: schemas/myapp_profiles_public/tables/org_profile_permissions/policies/auth_sel_rel_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/policies/enable_row_level_security


CREATE POLICY auth_sel_rel_ent_mem ON myapp_profiles_public.org_profile_permissions
FOR SELECT
TO authenticated
USING (
  profile_id IN (SELECT obj.id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt INNER JOIN myapp_profiles_public.org_profiles AS obj ON org_sprt.entity_id = obj.entity_id
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id())
);

