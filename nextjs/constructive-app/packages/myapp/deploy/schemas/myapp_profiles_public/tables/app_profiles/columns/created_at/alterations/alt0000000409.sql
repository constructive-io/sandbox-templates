-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/columns/created_at/alterations/alt0000000409
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/created_at/column


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN created_at SET DEFAULT now();

