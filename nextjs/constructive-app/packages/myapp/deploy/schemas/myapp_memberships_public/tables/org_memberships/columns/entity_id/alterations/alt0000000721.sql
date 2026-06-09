-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/entity_id/alterations/alt0000000721
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.entity_id IS E'References the entity (org or group) this membership belongs to';

