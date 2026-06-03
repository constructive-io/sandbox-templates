-- Deploy: schemas/myapp_events_public/tables/app_levels/indexes/app_levels_owner_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table
-- requires: schemas/myapp_events_public/tables/app_levels/columns/owner_id/column


CREATE INDEX app_levels_owner_id_idx ON myapp_events_public.app_levels USING BTREE ( owner_id );

