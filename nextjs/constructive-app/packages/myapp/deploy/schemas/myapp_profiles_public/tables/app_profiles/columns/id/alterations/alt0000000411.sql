-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/columns/id/alterations/alt0000000411
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/id/column


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN id SET NOT NULL;

