-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/entity_id/alterations/alt0000001014
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/entity_id/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN entity_id SET NOT NULL;

