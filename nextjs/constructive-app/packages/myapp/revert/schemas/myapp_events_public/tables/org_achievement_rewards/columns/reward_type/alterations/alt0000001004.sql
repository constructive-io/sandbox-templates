-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/reward_type/alterations/alt0000001004


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN reward_type DROP NOT NULL;


