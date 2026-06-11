-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/id/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  DROP COLUMN id RESTRICT;


