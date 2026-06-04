-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/profile_picture/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  DROP COLUMN profile_picture RESTRICT;


