-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/grantor_id/alterations/alt0000000442
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/grantor_id/column


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ALTER COLUMN grantor_id SET DEFAULT jwt_public.current_user_id();

