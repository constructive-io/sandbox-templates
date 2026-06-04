-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/permissions/alterations/alt0000000857
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/permissions/column


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN permissions SET DEFAULT (lpad('', 64, '0'))::bit(64);

