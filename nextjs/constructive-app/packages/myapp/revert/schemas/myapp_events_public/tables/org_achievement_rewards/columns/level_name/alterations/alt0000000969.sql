-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/level_name/alterations/alt0000000969


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN level_name DROP NOT NULL;


