-- Deploy: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/permissions/alterations/alt0000000045
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/table
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/permissions/column


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  ALTER COLUMN permissions SET DEFAULT (lpad('', 64, '0'))::bit(64);

