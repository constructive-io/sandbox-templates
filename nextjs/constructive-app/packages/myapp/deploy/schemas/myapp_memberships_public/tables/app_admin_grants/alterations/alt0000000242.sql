-- Deploy: schemas/myapp_memberships_public/tables/app_admin_grants/alterations/alt0000000242
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_admin_grants/table


ALTER TABLE myapp_memberships_public.app_admin_grants 
  DISABLE ROW LEVEL SECURITY;

