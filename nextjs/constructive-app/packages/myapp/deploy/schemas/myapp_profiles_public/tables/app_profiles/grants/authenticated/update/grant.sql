-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table


GRANT UPDATE (name, slug, description, is_system, is_default) ON myapp_profiles_public.app_profiles TO authenticated;

