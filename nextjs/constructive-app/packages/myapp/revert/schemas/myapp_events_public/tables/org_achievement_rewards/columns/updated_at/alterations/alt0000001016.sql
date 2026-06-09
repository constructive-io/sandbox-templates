-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/updated_at/alterations/alt0000001016


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN updated_at DROP DEFAULT;


