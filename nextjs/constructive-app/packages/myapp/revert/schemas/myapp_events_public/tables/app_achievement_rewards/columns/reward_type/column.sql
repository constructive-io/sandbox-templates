-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/reward_type/column


ALTER TABLE myapp_events_public.app_achievement_rewards 
  DROP COLUMN reward_type RESTRICT;


