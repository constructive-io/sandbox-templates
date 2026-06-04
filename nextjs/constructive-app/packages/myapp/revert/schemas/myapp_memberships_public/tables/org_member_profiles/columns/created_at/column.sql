-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/created_at/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  DROP COLUMN created_at RESTRICT;


