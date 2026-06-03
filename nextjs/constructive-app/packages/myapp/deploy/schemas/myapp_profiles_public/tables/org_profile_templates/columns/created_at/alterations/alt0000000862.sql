-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/created_at/alterations/alt0000000862
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/created_at/column


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN created_at SET DEFAULT now();

