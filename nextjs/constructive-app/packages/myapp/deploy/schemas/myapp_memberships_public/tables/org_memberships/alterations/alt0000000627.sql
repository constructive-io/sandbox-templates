-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/alterations/alt0000000627
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table


ALTER TABLE myapp_memberships_public.org_memberships 
  DISABLE ROW LEVEL SECURITY;

