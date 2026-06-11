-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/table


GRANT DELETE ON myapp_profiles_public.app_profile_permissions TO authenticated;

