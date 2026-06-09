-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/updated_at/alterations/alt0000000407


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN updated_at DROP DEFAULT;


