-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/columns/slug/alterations/alt0000000454
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/columns/slug/column


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN slug SET NOT NULL;

