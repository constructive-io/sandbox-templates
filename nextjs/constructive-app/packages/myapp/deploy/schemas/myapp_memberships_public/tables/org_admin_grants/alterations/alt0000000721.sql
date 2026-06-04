-- Deploy: schemas/myapp_memberships_public/tables/org_admin_grants/alterations/alt0000000721
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_admin_grants/table


ALTER TABLE myapp_memberships_public.org_admin_grants 
  DISABLE ROW LEVEL SECURITY;

