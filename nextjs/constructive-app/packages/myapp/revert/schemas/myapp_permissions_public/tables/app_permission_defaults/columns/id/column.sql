-- Revert: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/id/column


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  DROP COLUMN id RESTRICT;


