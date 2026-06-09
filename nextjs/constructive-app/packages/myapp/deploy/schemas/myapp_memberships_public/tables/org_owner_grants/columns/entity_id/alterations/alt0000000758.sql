-- Deploy: schemas/myapp_memberships_public/tables/org_owner_grants/columns/entity_id/alterations/alt0000000758
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_public.org_owner_grants.entity_id IS E'The entity (org or group) this ownership grant applies to';

