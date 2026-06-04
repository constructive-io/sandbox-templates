-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/level_name/alterations/alt0000000377


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN level_name DROP NOT NULL;


