-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/columns/permissions/alterations/alt0000000472
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/columns/permissions/column


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN permissions SET NOT NULL;

