-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/is_disabled/alterations/alt0000000221
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/is_disabled/column


COMMENT ON COLUMN myapp_memberships_public.app_memberships.is_disabled IS 'Whether this membership is temporarily disabled';

