-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/indexes/org_achievement_rewards_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/entity_id/column


CREATE INDEX org_achievement_rewards_entity_id_idx ON myapp_events_public.org_achievement_rewards USING BTREE ( entity_id );

