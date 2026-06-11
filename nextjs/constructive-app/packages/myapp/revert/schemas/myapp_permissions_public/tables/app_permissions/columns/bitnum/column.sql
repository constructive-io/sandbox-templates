-- Revert: schemas/myapp_permissions_public/tables/app_permissions/columns/bitnum/column


ALTER TABLE myapp_permissions_public.app_permissions 
  DROP COLUMN bitnum RESTRICT;


