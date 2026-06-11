-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/policies/auth_sel_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/table
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/policies/enable_row_level_security


CREATE POLICY auth_sel_ent_mem ON myapp_limits_public.org_limit_caps
FOR SELECT
TO authenticated
USING (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id())
);

