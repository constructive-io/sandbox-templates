-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/table


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ADD COLUMN created_at timestamptz;

