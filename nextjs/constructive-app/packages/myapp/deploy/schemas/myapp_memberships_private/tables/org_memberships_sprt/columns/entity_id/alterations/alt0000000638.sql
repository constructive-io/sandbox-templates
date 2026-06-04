-- Deploy: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/entity_id/alterations/alt0000000638
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_private.org_memberships_sprt.entity_id IS E'References the entity (org or group) this permission resolution applies to';

