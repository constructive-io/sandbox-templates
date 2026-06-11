-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/permission_id/alterations/alt0000000435
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/permission_id/column


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ALTER COLUMN permission_id SET NOT NULL;

