-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/membership_id/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  DROP COLUMN membership_id RESTRICT;


