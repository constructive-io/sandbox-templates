-- Revert: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/permissions/alterations/alt0000000044


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  ALTER COLUMN permissions DROP NOT NULL;


