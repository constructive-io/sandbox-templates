-- Deploy: schemas/myapp_profiles_public/tables/org_profile_definition_grants/constraints/org_profile_definition_grants_permission_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/table


ALTER TABLE myapp_profiles_public.org_profile_definition_grants 
  ADD CONSTRAINT org_profile_definition_grants_permission_id_fkey 
    FOREIGN KEY(permission_id) 
    REFERENCES myapp_permissions_public.org_permissions (id) 
    ON DELETE CASCADE;

