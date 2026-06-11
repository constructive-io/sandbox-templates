-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/bio/alterations/alt0000000780


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN bio DROP DEFAULT;


