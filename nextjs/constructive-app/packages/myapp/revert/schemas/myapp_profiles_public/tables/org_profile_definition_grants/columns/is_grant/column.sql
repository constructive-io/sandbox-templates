-- Revert: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/is_grant/column


ALTER TABLE myapp_profiles_public.org_profile_definition_grants 
  DROP COLUMN is_grant RESTRICT;


