-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/created_at/alterations/alt0000000446
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/created_at/column


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ALTER COLUMN created_at SET DEFAULT now();

