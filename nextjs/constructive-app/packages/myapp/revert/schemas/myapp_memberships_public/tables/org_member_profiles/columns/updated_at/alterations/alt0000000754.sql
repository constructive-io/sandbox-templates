-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/updated_at/alterations/alt0000000754


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN updated_at DROP DEFAULT;


