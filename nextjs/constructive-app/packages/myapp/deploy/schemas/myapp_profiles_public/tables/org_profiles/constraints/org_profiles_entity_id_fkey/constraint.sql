-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/constraints/org_profiles_entity_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table


ALTER TABLE myapp_profiles_public.org_profiles 
  ADD CONSTRAINT org_profiles_entity_id_fkey 
    FOREIGN KEY(entity_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

