-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/entity_id/alterations/alt0000000981


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN entity_id DROP NOT NULL;


