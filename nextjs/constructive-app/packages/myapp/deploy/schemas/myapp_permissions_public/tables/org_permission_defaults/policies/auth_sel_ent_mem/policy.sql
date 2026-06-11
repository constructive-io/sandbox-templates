-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/policies/auth_sel_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/table
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/policies/enable_row_level_security


CREATE POLICY auth_sel_ent_mem ON myapp_permissions_public.org_permission_defaults
FOR SELECT
TO authenticated
USING (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000000000001000000') = '0000000000000000000000000000000000000000000000000000000001000000')
);

