-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/constraints/org_achievement_rewards_pkey/constraint


ALTER TABLE myapp_events_public.org_achievement_rewards 
  DROP CONSTRAINT org_achievement_rewards_pkey;


