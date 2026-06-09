-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/email/alterations/alt0000000777
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/email/column


COMMENT ON COLUMN myapp_memberships_public.org_member_profiles.email IS E'Email address visible to other entity members (auto-populated from verified primary email)';

