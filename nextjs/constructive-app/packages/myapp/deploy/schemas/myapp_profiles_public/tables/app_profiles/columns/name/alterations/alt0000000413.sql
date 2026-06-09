-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/columns/name/alterations/alt0000000413
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/name/column


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN name SET NOT NULL;

