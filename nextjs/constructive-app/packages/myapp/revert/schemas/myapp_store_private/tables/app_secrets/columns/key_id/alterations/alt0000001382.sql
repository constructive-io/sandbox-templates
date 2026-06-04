-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/key_id/alterations/alt0000001382


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN key_id DROP DEFAULT;


