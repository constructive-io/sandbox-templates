-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/target_name/alterations/alt0000000398


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN target_name DROP NOT NULL;


