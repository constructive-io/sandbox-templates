-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/id/alterations/alt0000000764
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/table
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/id/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN id SET NOT NULL;

