-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/constraints/org_member_profiles_membership_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/table


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ADD CONSTRAINT org_member_profiles_membership_id_fkey 
    FOREIGN KEY(membership_id) 
    REFERENCES myapp_memberships_public.org_memberships (id) 
    ON DELETE CASCADE;

