-- Deploy: schemas/myapp_events_public/tables/org_levels/indexes/org_levels_owner_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_levels/columns/owner_id/column


CREATE INDEX org_levels_owner_id_idx ON myapp_events_public.org_levels USING BTREE ( owner_id );

