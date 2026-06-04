-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/indexes/app_achievement_rewards_level_name_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/level_name/column


CREATE INDEX app_achievement_rewards_level_name_idx ON myapp_events_public.app_achievement_rewards USING BTREE ( level_name );

