-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/alterations/alt0000000480
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


ALTER TABLE myapp_permissions_public.org_permissions 
  DISABLE ROW LEVEL SECURITY;

