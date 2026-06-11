-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/reward_type/alterations/alt0000001005
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/reward_type/column


COMMENT ON COLUMN myapp_events_public.org_achievement_rewards.reward_type IS E'Type of reward: limit_credit or meter_credit';

