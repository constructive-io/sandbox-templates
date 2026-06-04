-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/columns/allow_external_members/alterations/alt0000000669
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/columns/allow_external_members/column


COMMENT ON COLUMN myapp_memberships_public.org_membership_settings.allow_external_members IS E'Whether descendants of this org may admit members who are not already org members (outside-collaborators toggle)';

