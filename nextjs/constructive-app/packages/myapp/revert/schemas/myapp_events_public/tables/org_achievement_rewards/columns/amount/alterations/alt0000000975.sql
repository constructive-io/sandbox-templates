-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/amount/alterations/alt0000000975


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN amount DROP NOT NULL;


