-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_grants/indexes/org_permission_default_grants_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_grants/columns/entity_id/column


CREATE INDEX org_permission_default_grants_entity_id_idx ON myapp_memberships_public.org_permission_default_grants USING BTREE ( entity_id );

