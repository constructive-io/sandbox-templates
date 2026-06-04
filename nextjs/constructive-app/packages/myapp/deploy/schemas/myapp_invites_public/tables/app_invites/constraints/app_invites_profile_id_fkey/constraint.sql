-- Deploy: schemas/myapp_invites_public/tables/app_invites/constraints/app_invites_profile_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table


ALTER TABLE myapp_invites_public.app_invites 
  ADD CONSTRAINT app_invites_profile_id_fkey 
    FOREIGN KEY(profile_id) 
    REFERENCES myapp_profiles_public.app_profiles (id) 
    ON DELETE SET NULL;

