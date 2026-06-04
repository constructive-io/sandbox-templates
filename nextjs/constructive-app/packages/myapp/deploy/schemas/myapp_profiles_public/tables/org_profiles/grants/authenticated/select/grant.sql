-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table


GRANT SELECT ON myapp_profiles_public.org_profiles TO authenticated;

