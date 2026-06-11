-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/title/alterations/alt0000000778


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN title DROP DEFAULT;


