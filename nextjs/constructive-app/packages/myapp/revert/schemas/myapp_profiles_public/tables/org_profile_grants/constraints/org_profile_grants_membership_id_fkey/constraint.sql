-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/constraints/org_profile_grants_membership_id_fkey/constraint


ALTER TABLE myapp_profiles_public.org_profile_grants 
  DROP CONSTRAINT org_profile_grants_membership_id_fkey;


