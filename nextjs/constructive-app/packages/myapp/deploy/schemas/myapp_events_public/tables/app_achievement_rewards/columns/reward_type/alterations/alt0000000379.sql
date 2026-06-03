-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/reward_type/alterations/alt0000000379
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/reward_type/column


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN reward_type SET NOT NULL;

