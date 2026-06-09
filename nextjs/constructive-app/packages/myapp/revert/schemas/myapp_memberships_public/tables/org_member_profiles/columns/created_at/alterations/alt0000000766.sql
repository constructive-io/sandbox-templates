-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/created_at/alterations/alt0000000766


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN created_at DROP DEFAULT;


