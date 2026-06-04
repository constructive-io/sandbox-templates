-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/columns/is_default/alterations/alt0000000460
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/columns/is_default/column


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN is_default SET NOT NULL;

