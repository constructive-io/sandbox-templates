-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/indexes/org_memberships_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/entity_id/column


CREATE INDEX org_memberships_entity_id_idx ON myapp_memberships_public.org_memberships USING BTREE ( entity_id );

