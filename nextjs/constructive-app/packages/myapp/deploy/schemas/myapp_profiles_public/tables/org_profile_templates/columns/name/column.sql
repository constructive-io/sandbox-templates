-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/name/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ADD COLUMN name citext;

