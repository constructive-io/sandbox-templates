-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/expires_interval/alterations/alt0000000405
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/expires_interval/column


COMMENT ON COLUMN myapp_events_public.app_achievement_rewards.expires_interval IS E'Optional duration after which the granted credit expires; NULL means never expires';

