-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/is_approved/alterations/alt0000000215
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/is_approved/column


COMMENT ON COLUMN myapp_memberships_public.app_memberships.is_approved IS 'Whether this membership has been approved by an admin';

