-- Revert: schemas/myapp_permissions_public/tables/app_permissions/constraints/app_permissions_name_key/constraint


ALTER TABLE myapp_permissions_public.app_permissions 
  DROP CONSTRAINT app_permissions_name_key;


