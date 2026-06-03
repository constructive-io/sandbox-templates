-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/entity_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ADD COLUMN entity_id uuid;

