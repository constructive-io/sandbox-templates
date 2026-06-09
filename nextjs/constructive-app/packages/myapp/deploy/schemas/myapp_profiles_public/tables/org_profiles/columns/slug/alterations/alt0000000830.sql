-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/slug/alterations/alt0000000830
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/slug/column


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN slug SET NOT NULL;

