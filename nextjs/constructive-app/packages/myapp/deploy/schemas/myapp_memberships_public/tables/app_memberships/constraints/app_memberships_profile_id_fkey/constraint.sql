-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/constraints/app_memberships_profile_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table


ALTER TABLE myapp_memberships_public.app_memberships 
  ADD CONSTRAINT app_memberships_profile_id_fkey 
    FOREIGN KEY(profile_id) 
    REFERENCES myapp_profiles_public.app_profiles (id) 
    ON DELETE SET NULL;

