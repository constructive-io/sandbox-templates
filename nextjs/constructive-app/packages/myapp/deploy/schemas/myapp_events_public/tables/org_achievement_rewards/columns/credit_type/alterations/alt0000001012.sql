-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/credit_type/alterations/alt0000001012
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/credit_type/column


COMMENT ON COLUMN myapp_events_public.org_achievement_rewards.credit_type IS E'Credit type: permanent, expiring, etc.';

