-- Deploy: schemas/myapp_memberships_public/tables/org_members/columns/is_admin/alterations/alt0000000729
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_members/table
-- requires: schemas/myapp_memberships_public/tables/org_members/columns/is_admin/column


ALTER TABLE myapp_memberships_public.org_members 
  ALTER COLUMN is_admin SET NOT NULL;

