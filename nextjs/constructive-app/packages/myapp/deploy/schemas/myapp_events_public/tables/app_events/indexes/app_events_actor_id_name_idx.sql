-- Deploy: schemas/myapp_events_public/tables/app_events/indexes/app_events_actor_id_name_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table
-- requires: schemas/myapp_events_public/tables/app_events/columns/name/column
-- requires: schemas/myapp_events_public/tables/app_events/columns/actor_id/column


CREATE INDEX app_events_actor_id_name_idx ON myapp_events_public.app_events USING BTREE ( actor_id, name );

