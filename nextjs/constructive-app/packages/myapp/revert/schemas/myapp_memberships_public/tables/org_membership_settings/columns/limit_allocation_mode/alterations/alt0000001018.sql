-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/alterations/alt0000001018


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN limit_allocation_mode DROP NOT NULL;


