-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/reward_type/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ADD COLUMN reward_type text;

