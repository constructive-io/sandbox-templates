-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN delete_member_cascade_children RESTRICT;


