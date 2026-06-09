-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/columns/permissions/alterations/alt0000000419
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/permissions/column


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN permissions SET DEFAULT (lpad('', 64, '0'))::bit(64);

