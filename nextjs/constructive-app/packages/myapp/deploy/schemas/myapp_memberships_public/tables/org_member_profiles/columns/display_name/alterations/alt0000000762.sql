-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/display_name/alterations/alt0000000762
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/display_name/column


COMMENT ON COLUMN myapp_memberships_public.org_member_profiles.display_name IS 'Display name shown to other entity members';

