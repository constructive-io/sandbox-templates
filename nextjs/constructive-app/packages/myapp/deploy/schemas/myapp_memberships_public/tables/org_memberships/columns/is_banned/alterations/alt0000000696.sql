-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/is_banned/alterations/alt0000000696
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/is_banned/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.is_banned IS 'Whether this member has been banned from the entity';

