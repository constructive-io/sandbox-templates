-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/profile_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/table


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ADD COLUMN profile_id uuid;

