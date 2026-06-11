-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/level_name/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  DROP COLUMN level_name RESTRICT;


