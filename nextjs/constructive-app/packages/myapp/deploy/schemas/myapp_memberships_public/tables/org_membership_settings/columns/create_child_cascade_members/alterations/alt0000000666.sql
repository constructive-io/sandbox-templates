-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/columns/create_child_cascade_members/alterations/alt0000000666
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/columns/create_child_cascade_members/column


COMMENT ON COLUMN myapp_memberships_public.org_membership_settings.create_child_cascade_members IS E'When a child entity is created, whether to auto-add existing org-level members (non-admin, non-owner) as child-entity members';

