-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN limit_allocation_mode RESTRICT;


