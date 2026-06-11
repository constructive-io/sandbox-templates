-- Deploy: schemas/myapp_profiles_public/tables/org_profile_permissions/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/table


GRANT UPDATE ON myapp_profiles_public.org_profile_permissions TO authenticated;

