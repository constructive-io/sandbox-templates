-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/title/alterations/alt0000000766
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/title/column


COMMENT ON COLUMN myapp_memberships_public.org_member_profiles.title IS 'Job title or role description visible to other entity members';

