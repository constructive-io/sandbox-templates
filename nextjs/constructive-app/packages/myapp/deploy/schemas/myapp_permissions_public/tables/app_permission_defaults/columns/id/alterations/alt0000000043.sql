-- Deploy: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/id/alterations/alt0000000043
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/table
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/id/column


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  ALTER COLUMN id SET DEFAULT uuidv7();

