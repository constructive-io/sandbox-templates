-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/policies/auth_sel_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table


CREATE POLICY auth_sel_ent_mem ON myapp_events_public.org_level_requirements
FOR SELECT
TO authenticated
USING (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id())
);

