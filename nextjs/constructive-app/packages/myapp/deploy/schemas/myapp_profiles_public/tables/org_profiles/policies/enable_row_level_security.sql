-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table


ALTER TABLE myapp_profiles_public.org_profiles 
  ENABLE ROW LEVEL SECURITY;

