-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/columns/amount/alterations/alt0000000383


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN amount DROP NOT NULL;


