-- Revert: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/grantor_id/alterations/alt0000000841


ALTER TABLE myapp_profiles_public.org_profile_definition_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


