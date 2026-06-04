-- Deploy: schemas/myapp_memberships_public/tables/app_grants/alterations/alt0000000266
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/table


ALTER TABLE myapp_memberships_public.app_grants 
  DISABLE ROW LEVEL SECURITY;

