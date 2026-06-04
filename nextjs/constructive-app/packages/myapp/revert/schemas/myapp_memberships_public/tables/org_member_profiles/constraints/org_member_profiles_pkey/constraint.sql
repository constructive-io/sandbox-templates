-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/constraints/org_member_profiles_pkey/constraint


ALTER TABLE myapp_memberships_public.org_member_profiles 
  DROP CONSTRAINT org_member_profiles_pkey;


