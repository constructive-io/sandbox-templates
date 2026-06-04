-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/columns/description/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ADD COLUMN description text;

