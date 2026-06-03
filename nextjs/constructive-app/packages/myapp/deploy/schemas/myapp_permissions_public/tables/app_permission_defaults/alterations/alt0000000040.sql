-- Deploy: schemas/myapp_permissions_public/tables/app_permission_defaults/alterations/alt0000000040
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/table


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  DISABLE ROW LEVEL SECURITY;

