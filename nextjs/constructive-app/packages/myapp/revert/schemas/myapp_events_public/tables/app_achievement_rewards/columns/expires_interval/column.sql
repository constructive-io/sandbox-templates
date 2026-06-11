-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/expires_interval/column


ALTER TABLE myapp_events_public.app_achievement_rewards 
  DROP COLUMN expires_interval RESTRICT;


