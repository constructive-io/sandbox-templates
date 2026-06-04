-- Revert: schemas/myapp_permissions_public/tables/app_permission_defaults/constraints/app_permission_defaults_pkey/constraint


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  DROP CONSTRAINT app_permission_defaults_pkey;


