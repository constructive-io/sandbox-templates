-- Deploy: schemas/myapp_events_public/tables/app_level_grants/indexes/app_level_grants_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table
-- requires: schemas/myapp_events_public/tables/app_level_grants/columns/actor_id/column


CREATE INDEX app_level_grants_actor_id_idx ON myapp_events_public.app_level_grants USING BTREE ( actor_id );

