-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/constraints/app_profile_definition_grants_grantor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/table


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ADD CONSTRAINT app_profile_definition_grants_grantor_id_fkey 
    FOREIGN KEY(grantor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

