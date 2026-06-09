-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/reward_type/alterations/alt0000000396


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN reward_type DROP NOT NULL;


