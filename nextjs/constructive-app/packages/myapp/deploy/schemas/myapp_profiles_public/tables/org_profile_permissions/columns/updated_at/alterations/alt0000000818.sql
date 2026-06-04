-- Deploy: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/updated_at/alterations/alt0000000818
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/updated_at/column


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  ALTER COLUMN updated_at SET DEFAULT now();

