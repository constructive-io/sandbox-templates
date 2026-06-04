-- Deploy: schemas/myapp_events_public/tables/org_level_grants/indexes/org_level_grants_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_public/tables/org_level_grants/columns/actor_id/column


CREATE INDEX org_level_grants_actor_id_idx ON myapp_events_public.org_level_grants USING BTREE ( actor_id );

