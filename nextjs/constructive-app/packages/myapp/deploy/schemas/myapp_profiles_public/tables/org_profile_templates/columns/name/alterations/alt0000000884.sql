-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/name/alterations/alt0000000884
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/name/column


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN name SET NOT NULL;

