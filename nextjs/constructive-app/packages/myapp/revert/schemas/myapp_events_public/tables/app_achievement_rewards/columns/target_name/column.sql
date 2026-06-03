-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/target_name/column


ALTER TABLE myapp_events_public.app_achievement_rewards 
  DROP COLUMN target_name RESTRICT;


