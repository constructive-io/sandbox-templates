-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/is_owner/alterations/alt0000000693
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/is_owner/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.is_owner IS 'Whether the actor is the owner of this entity';

