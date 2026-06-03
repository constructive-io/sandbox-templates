-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/alterations/alt0000000985
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/table
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN limit_allocation_mode SET DEFAULT 'pooled';

