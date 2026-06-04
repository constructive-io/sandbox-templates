-- Revert: schemas/myapp_permissions_public/tables/app_permissions/columns/bitstr/alterations/alt0000000037


ALTER TABLE myapp_permissions_public.app_permissions 
  ALTER COLUMN bitstr DROP DEFAULT;


