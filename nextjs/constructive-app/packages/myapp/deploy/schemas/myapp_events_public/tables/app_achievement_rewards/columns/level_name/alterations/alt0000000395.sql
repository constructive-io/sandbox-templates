-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/level_name/alterations/alt0000000395
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/level_name/column


COMMENT ON COLUMN myapp_events_public.app_achievement_rewards.level_name IS 'Name of the level this reward is granted for';

