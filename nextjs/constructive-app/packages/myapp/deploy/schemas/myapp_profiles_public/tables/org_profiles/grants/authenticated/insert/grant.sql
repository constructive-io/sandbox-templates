-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table


GRANT INSERT ON myapp_profiles_public.org_profiles TO authenticated;

