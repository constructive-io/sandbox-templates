-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/credit_type/alterations/alt0000000387
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/credit_type/column


COMMENT ON COLUMN myapp_events_public.app_achievement_rewards.credit_type IS E'Credit type: permanent, expiring, etc.';

