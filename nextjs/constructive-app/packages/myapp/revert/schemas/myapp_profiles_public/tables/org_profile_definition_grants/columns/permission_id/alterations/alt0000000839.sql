-- Revert: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/permission_id/alterations/alt0000000839


ALTER TABLE myapp_profiles_public.org_profile_definition_grants 
  ALTER COLUMN permission_id DROP NOT NULL;


