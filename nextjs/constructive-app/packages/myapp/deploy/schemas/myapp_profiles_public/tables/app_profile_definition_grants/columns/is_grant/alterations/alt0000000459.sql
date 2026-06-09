-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/is_grant/alterations/alt0000000459
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/is_grant/column


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ALTER COLUMN is_grant SET DEFAULT true;

