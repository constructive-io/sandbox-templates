-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/display_name/alterations/alt0000000761
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/table
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/display_name/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN display_name SET DEFAULT '';

