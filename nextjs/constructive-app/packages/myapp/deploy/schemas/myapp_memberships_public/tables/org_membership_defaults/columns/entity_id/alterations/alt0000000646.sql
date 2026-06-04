-- Deploy: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/entity_id/alterations/alt0000000646
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_public.org_membership_defaults.entity_id IS 'References the entity these membership defaults apply to';

