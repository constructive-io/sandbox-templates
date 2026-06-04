-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/email/alterations/alt0000000763
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/table
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/email/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN email SET DEFAULT '';

