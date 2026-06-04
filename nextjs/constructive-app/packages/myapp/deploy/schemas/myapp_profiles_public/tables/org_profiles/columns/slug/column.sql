-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/slug/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table


ALTER TABLE myapp_profiles_public.org_profiles 
  ADD COLUMN slug text;

