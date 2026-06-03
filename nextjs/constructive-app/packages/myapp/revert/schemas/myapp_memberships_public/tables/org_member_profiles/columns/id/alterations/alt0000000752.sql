-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/id/alterations/alt0000000752


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN id DROP DEFAULT;


