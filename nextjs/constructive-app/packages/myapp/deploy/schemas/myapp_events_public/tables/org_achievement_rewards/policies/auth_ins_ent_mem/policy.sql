-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/policies/auth_ins_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/policies/enable_row_level_security


CREATE POLICY auth_ins_ent_mem ON myapp_events_public.org_achievement_rewards
FOR INSERT
TO authenticated
WITH CHECK (
  entity_id IN (SELECT org_sprt.entity_id
  FROM myapp_memberships_private.org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000100000000000000') = '0000000000000000000000000000000000000000000000000100000000000000')
);

