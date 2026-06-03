-- Deploy: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/id/alterations/alt0000000812
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/id/column


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  ALTER COLUMN id SET DEFAULT uuidv7();

