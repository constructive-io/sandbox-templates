-- Deploy: schemas/myapp_memberships_public/tables/org_grants/columns/entity_id/alterations/alt0000000795
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_grants/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_public.org_grants.entity_id IS E'The entity (org or group) this permission grant applies to';

