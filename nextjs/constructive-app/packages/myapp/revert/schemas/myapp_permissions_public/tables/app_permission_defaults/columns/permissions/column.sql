-- Revert: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/permissions/column


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  DROP COLUMN permissions RESTRICT;


