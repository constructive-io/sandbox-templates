-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/id/alterations/alt0000000968


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN id DROP DEFAULT;


