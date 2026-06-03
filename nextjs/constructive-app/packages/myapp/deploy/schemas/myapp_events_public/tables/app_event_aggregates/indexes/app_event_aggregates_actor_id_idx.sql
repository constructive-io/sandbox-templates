-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/indexes/app_event_aggregates_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/actor_id/column


CREATE INDEX app_event_aggregates_actor_id_idx ON myapp_events_public.app_event_aggregates USING BTREE ( actor_id );

