-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/id/alterations/alt0000000376


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN id DROP DEFAULT;


