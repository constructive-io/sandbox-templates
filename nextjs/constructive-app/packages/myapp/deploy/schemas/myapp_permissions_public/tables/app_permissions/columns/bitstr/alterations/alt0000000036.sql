-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/columns/bitstr/alterations/alt0000000036
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table
-- requires: schemas/myapp_permissions_public/tables/app_permissions/columns/bitstr/column


ALTER TABLE myapp_permissions_public.app_permissions 
  ALTER COLUMN bitstr SET NOT NULL;

