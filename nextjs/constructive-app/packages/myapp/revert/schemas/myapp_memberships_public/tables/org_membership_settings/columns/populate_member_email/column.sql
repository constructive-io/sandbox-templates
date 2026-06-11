-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/populate_member_email/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN populate_member_email RESTRICT;


