-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/indexes/org_permission_defaults_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/table
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/entity_id/column


CREATE INDEX org_permission_defaults_entity_id_idx ON myapp_permissions_public.org_permission_defaults USING BTREE ( entity_id );

