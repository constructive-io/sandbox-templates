-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/is_admin/alterations/alt0000000696
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/is_admin/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.is_admin IS 'Whether the actor has admin privileges on this entity';

