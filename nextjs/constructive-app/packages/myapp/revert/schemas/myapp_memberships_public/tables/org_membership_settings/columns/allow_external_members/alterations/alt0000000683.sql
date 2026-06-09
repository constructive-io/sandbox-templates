-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/allow_external_members/alterations/alt0000000683


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN allow_external_members DROP DEFAULT;


