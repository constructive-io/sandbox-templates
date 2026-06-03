-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/indexes/org_achievement_rewards_level_name_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/level_name/column


CREATE INDEX org_achievement_rewards_level_name_idx ON myapp_events_public.org_achievement_rewards USING BTREE ( level_name );

