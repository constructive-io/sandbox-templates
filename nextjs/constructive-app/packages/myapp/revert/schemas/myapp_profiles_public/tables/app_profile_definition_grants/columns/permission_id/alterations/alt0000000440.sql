-- Revert: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/permission_id/alterations/alt0000000440


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ALTER COLUMN permission_id DROP NOT NULL;


