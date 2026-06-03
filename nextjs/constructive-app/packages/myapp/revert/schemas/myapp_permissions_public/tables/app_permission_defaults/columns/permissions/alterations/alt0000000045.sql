-- Revert: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/permissions/alterations/alt0000000045


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  ALTER COLUMN permissions DROP DEFAULT;


