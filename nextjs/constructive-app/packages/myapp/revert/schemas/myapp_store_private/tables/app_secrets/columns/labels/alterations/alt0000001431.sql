-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/labels/alterations/alt0000001431


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN labels DROP DEFAULT;


