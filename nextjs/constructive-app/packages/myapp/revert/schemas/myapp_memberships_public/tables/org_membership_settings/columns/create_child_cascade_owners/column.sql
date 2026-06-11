-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/create_child_cascade_owners/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN create_child_cascade_owners RESTRICT;


