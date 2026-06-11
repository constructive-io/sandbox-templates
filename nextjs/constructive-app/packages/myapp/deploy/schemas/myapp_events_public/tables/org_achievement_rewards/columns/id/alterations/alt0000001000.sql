-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/id/alterations/alt0000001000
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/id/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN id SET NOT NULL;

