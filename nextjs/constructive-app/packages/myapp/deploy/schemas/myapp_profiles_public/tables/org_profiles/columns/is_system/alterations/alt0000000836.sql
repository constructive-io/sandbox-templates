-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/is_system/alterations/alt0000000836
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/is_system/column


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN is_system SET NOT NULL;

