-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/is_read_only/alterations/alt0000000709
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/is_read_only/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.is_read_only IS E'Whether this member has read-only access (blocks mutations when true)';

