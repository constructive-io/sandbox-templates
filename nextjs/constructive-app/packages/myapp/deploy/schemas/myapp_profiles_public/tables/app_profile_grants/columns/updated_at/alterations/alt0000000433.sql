-- Deploy: schemas/myapp_profiles_public/tables/app_profile_grants/columns/updated_at/alterations/alt0000000433
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/columns/updated_at/column


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ALTER COLUMN updated_at SET DEFAULT now();

