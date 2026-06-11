-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/created_at/alterations/alt0000000437
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/created_at/column


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ALTER COLUMN created_at SET DEFAULT now();

