-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ADD COLUMN updated_at timestamptz;

