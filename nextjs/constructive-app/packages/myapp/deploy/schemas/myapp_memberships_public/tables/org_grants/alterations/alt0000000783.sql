-- Deploy: schemas/myapp_memberships_public/tables/org_grants/alterations/alt0000000783
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_grants/table


ALTER TABLE myapp_memberships_public.org_grants 
  DISABLE ROW LEVEL SECURITY;

