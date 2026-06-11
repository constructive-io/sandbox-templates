-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/id/alterations/alt0000000827
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/id/column


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN id SET DEFAULT uuidv7();

