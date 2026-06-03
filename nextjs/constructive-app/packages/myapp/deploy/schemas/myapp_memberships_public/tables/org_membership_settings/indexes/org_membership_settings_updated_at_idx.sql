-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/indexes/org_membership_settings_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/table
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/columns/updated_at/column


CREATE INDEX org_membership_settings_updated_at_idx ON myapp_memberships_public.org_membership_settings ( updated_at );

