-- Deploy: schemas/myapp_invites_public/tables/org_invites/constraints/org_invites_profile_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table


ALTER TABLE myapp_invites_public.org_invites 
  ADD CONSTRAINT org_invites_profile_id_fkey 
    FOREIGN KEY(profile_id) 
    REFERENCES myapp_profiles_public.org_profiles (id) 
    ON DELETE SET NULL;

