-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/indexes/app_achievement_rewards_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/updated_at/column


CREATE INDEX app_achievement_rewards_updated_at_idx ON myapp_events_public.app_achievement_rewards ( updated_at );

