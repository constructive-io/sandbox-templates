-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/level_name/alterations/alt0000001003
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/level_name/column


COMMENT ON COLUMN myapp_events_public.org_achievement_rewards.level_name IS 'Name of the level this reward is granted for';

