-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/id/alterations/alt0000000478
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/table
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/id/column


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  ALTER COLUMN id SET NOT NULL;

