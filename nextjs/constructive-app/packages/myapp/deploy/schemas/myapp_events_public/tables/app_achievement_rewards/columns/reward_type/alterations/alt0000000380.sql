-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/reward_type/alterations/alt0000000380
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/reward_type/column


COMMENT ON COLUMN myapp_events_public.app_achievement_rewards.reward_type IS E'Type of reward: limit_credit or meter_credit';

