-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/columns/description/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table


ALTER TABLE myapp_permissions_public.app_permissions 
  ADD COLUMN description text;

