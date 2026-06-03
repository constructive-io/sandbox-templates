-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/granted/alterations/alt0000000702
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/granted/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.granted IS E'Bitmask of permissions directly granted to this member (not from profiles)';

