-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/constraints/app_profile_definition_grants_permission_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/table


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ADD CONSTRAINT app_profile_definition_grants_permission_id_fkey 
    FOREIGN KEY(permission_id) 
    REFERENCES myapp_permissions_public.app_permissions (id) 
    ON DELETE CASCADE;

