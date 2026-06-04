-- Deploy: schemas/myapp_limits_public/tables/org_limits/policies/auth_del_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table


CREATE POLICY auth_del_ent_mem ON myapp_limits_public.org_limits
FOR DELETE
TO authenticated
USING (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000000000000000001') = '0000000000000000000000000000000000000000000000000000000000000001')
);

