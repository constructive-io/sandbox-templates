-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/is_banned/alterations/alt0000000218
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/is_banned/column


COMMENT ON COLUMN myapp_memberships_public.app_memberships.is_banned IS 'Whether this member has been banned from the entity';

