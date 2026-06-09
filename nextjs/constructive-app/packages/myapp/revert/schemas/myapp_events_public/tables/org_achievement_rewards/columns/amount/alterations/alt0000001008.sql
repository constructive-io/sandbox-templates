-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/amount/alterations/alt0000001008


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN amount DROP NOT NULL;


