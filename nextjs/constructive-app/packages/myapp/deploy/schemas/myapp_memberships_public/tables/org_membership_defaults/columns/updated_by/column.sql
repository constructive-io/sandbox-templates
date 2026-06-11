-- Deploy: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/updated_by/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_defaults/table


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  ADD COLUMN updated_by uuid;

