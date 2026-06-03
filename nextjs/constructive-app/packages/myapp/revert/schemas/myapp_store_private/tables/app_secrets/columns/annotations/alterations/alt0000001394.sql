-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/annotations/alterations/alt0000001394


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN annotations DROP DEFAULT;


