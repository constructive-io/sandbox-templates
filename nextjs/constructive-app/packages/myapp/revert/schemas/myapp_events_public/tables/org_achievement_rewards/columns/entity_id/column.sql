-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/columns/entity_id/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  DROP COLUMN entity_id RESTRICT;


