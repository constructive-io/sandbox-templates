-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/table


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ADD COLUMN updated_at timestamptz;

