-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/target_name/alterations/alt0000000973


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN target_name DROP NOT NULL;


