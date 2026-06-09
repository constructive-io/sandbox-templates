-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/slug/alterations/alt0000000886
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/slug/column


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN slug SET NOT NULL;

