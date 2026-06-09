-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/alterations/alt0000000670


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN delete_member_cascade_children DROP NOT NULL;


