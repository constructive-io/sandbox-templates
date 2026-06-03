-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/populate_member_email/alterations/alt0000000673


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN populate_member_email DROP NOT NULL;


