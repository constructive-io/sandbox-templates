-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/bio/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/table


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ADD COLUMN bio text;

