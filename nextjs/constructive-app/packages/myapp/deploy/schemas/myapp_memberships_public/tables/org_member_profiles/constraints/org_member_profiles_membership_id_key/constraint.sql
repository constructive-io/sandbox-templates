-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/constraints/org_member_profiles_membership_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/table


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ADD CONSTRAINT org_member_profiles_membership_id_key 
    UNIQUE (membership_id);

