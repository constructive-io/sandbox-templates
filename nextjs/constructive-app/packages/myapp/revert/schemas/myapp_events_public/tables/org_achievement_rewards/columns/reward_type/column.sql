-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/reward_type/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  DROP COLUMN reward_type RESTRICT;


