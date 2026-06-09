-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/credit_type/alterations/alt0000000403


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN credit_type DROP DEFAULT;


