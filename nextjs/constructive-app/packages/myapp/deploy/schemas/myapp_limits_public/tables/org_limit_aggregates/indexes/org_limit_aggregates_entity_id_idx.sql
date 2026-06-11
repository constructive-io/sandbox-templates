-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/indexes/org_limit_aggregates_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/entity_id/column


CREATE INDEX org_limit_aggregates_entity_id_idx ON myapp_limits_public.org_limit_aggregates USING BTREE ( entity_id );

