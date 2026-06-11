-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/indexes/app_namespace_events_namespace_id_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/created_at/column
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/namespace_id/column


CREATE INDEX app_namespace_events_namespace_id_created_at_idx ON myapp_infra_public.app_namespace_events USING BTREE ( namespace_id, created_at );

