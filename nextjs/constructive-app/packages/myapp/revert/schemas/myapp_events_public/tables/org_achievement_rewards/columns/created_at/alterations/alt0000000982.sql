-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/created_at/alterations/alt0000000982


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN created_at DROP DEFAULT;


