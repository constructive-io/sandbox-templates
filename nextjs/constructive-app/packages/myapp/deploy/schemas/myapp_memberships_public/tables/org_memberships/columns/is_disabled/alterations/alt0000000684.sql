-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/is_disabled/alterations/alt0000000684
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/is_disabled/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.is_disabled IS 'Whether this membership is temporarily disabled';

