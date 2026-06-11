-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/indexes/org_permission_default_permissions_permission_id_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/entity_id/column
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/permission_id/column


CREATE UNIQUE INDEX org_permission_default_permissions_permission_id_entity_id_idx ON myapp_memberships_public.org_permission_default_permissions USING BTREE ( permission_id, entity_id );

