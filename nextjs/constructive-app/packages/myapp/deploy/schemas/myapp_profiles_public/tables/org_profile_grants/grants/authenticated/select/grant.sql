-- Deploy: schemas/myapp_profiles_public/tables/org_profile_grants/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_grants/table


GRANT SELECT ON myapp_profiles_public.org_profile_grants TO authenticated;

