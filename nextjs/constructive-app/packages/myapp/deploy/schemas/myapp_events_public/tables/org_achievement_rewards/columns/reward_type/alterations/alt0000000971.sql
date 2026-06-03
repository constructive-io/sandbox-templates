-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/reward_type/alterations/alt0000000971
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/reward_type/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN reward_type SET NOT NULL;

