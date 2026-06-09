-- Deploy: schemas/myapp_memberships_public/tables/org_members/columns/is_admin/alterations/alt0000000731
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_members/columns/is_admin/column


COMMENT ON COLUMN myapp_memberships_public.org_members.is_admin IS 'Whether this member has admin privileges';

