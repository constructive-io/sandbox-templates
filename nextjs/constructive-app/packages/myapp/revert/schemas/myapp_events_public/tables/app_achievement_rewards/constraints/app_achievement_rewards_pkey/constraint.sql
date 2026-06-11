-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/constraints/app_achievement_rewards_pkey/constraint


ALTER TABLE myapp_events_public.app_achievement_rewards 
  DROP CONSTRAINT app_achievement_rewards_pkey;


