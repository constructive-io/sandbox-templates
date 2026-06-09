-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/alterations/alt0000000799
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table


ALTER TABLE myapp_memberships_public.org_permission_default_permissions 
  DISABLE ROW LEVEL SECURITY;

