-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/email/alterations/alt0000000776


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN email DROP DEFAULT;


