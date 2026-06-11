-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/updated_at/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  DROP COLUMN updated_at RESTRICT;


