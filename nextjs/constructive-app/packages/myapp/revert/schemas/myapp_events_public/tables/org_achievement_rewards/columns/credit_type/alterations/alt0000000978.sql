-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/credit_type/alterations/alt0000000978


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN credit_type DROP DEFAULT;


