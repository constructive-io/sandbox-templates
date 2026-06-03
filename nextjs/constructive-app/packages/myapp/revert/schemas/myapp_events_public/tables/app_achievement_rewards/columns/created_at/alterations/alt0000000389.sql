-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/created_at/alterations/alt0000000389


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN created_at DROP DEFAULT;


