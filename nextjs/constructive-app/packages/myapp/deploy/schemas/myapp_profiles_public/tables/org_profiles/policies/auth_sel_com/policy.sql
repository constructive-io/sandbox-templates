-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/policies/auth_sel_com/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/policies/enable_row_level_security


CREATE POLICY auth_sel_com ON myapp_profiles_public.org_profiles
FOR SELECT
TO authenticated
USING (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id()) OR entity_id IS NULL
);

