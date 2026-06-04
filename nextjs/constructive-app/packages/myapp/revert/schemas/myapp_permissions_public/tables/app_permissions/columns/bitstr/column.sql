-- Revert: schemas/myapp_permissions_public/tables/app_permissions/columns/bitstr/column


ALTER TABLE myapp_permissions_public.app_permissions 
  DROP COLUMN bitstr RESTRICT;


